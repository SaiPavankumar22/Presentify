from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from langchain_groq import ChatGroq
import requests
import traceback
import json
import logging
import os
from dotenv import load_dotenv

load_dotenv()


# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Initialize LLM using ChatGroq
try:
    llm = ChatGroq(
        temperature=0.6,
        groq_api_key=os.getenv('GROQ_API_KEY'),
        model_name="llama-3.3-70b-versatile"
    )
except Exception as e:
    logger.error(f"Failed to initialize LLM: {str(e)}")
    raise

# Unsplash API Credentials
UNSPLASH_ACCESS_KEY = os.getenv('UNSPLASH_ACCESS_KEY')

@app.route('/generate_ppt_data', methods=['POST'])
def generate_ppt_data():
    """
    Receives user input (text, number of slides), processes it with LLM, 
    fetches images from Unsplash, and returns structured slide data.
    """
    try:
        data = request.json
        text = data.get("text")
        num_slides = data.get("numSlides", 5)

        if not text:
            return jsonify({"error": "No input text provided"}), 400

        logger.info(f"Processing request for text: {text[:100]}... with {num_slides} slides")
        slide_data = process_text_with_llm(text, num_slides)

        if isinstance(slide_data, list) and len(slide_data) > 0 and "error" in slide_data[0]:
            logger.error(f"LLM processing failed: {slide_data[0]['content']}")
            return jsonify({"error": slide_data[0]['content']}), 500

        # Fetch images from Unsplash for each slide
        for slide in slide_data:
            if "title" in slide:
                keyword = slide["title"].split()[0]  # Use first word as a keyword
                slide["image"] = fetch_unsplash_image(keyword)

        logger.info("Successfully generated slide data")
        return jsonify({"slides": slide_data})
    except Exception as e:
        logger.error(f"Error in generate_ppt_data: {str(e)}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


def process_text_with_llm(text, num_slides):
    prompt = f"""
    Generate a structured PowerPoint presentation for the given topic: "{text}".
    
    Create a professional presentation following Microsoft PowerPoint's standard templates:
    
    1. First slide (Title Slide):
       - Main title (bold, centered, large font)
       - Optional subtitle
    
    2. Content Slides ({num_slides - 1} slides):
       - Clear section title (top of slide)
       - Bullet points (max 5-6 per slide)
       - Each bullet should be concise and meaningful
       - Include a relevant image keyword that best represents the slide's content
    
    Format each slide as a JSON object with these fields:
    - title: The slide title
    - subtitle: (optional) Subtitle for title slide
    - content: Array of bullet points for content slides
    - layout: "title" for first slide, "content" for others
    - imageKeyword: A specific keyword for the slide's image (make it descriptive and relevant)
    - position: Specific position data for content placement
    
    Return as JSON array:
    [
        {{
            "title": "Presentation Title",
            "subtitle": "Optional Subtitle",
            "layout": "title",
            "position": {{ "title": {{ "x": 50, "y": 40 }}, "subtitle": {{ "x": 50, "y": 60 }} }}
        }},
        {{
            "title": "Section Title",
            "content": ["Bullet 1", "Bullet 2", "Bullet 3"],
            "layout": "content",
            "imageKeyword": "specific descriptive keyword",
            "position": {{ 
                "title": {{ "x": 50, "y": 15 }},
                "content": {{ "x": 10, "y": 30 }},
                "image": {{ "x": 70, "y": 50 }}
            }}
        }}
    ]
    """
    try:
        logger.info("Sending prompt to LLM")
        response = llm.invoke(prompt)
        
        response_text = response.content if hasattr(response, "content") else str(response)
        logger.info(f"Received response from LLM: {response_text[:100]}...")
        
        # Clean up JSON formatting
        response_text = response_text.strip()
        if response_text.startswith("```json"):
            response_text = response_text[7:].strip("```").strip()
        elif response_text.startswith("```"):
            response_text = response_text[3:].strip("```").strip()
        
        try:
            slide_data = json.loads(response_text)
            
            # Process each slide to get relevant images
            for slide in slide_data:
                if slide["layout"] == "content":
                    # Use the specific imageKeyword if provided, otherwise use title
                    image_keyword = slide.get("imageKeyword", slide["title"])
                    slide["image"] = fetch_unsplash_image(image_keyword)
            
            return slide_data
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON: {str(e)}")
            return [{"title": "Error", "content": "Invalid JSON response from LLM"}]
        
        if not isinstance(slide_data, list) or not all(isinstance(slide, dict) for slide in slide_data):
            logger.error("Malformed slide data structure")
            return [{"title": "Error", "content": "Malformed JSON response"}]

        return slide_data
    except Exception as e:
        logger.error(f"LLM processing error: {str(e)}")
        return [{"title": "Error", "content": f"LLM failed to process request: {str(e)}"}]


def fetch_unsplash_image(keyword):
    """
    Fetches an image URL from Unsplash based on the given keyword.
    Uses the title and content context to get more relevant images.
    """
    try:
        logger.info(f"Fetching image for keyword: {keyword}")
        # Clean and enhance the keyword
        cleaned_keyword = keyword.replace("'s", "").replace(".", "").strip()
        # Add relevant search parameters
        url = (
            f"https://api.unsplash.com/photos/random"
            f"?query={cleaned_keyword}"
            f"&orientation=landscape"  # Prefer landscape images for slides
            f"&content_filter=high"    # Get high-quality images
            f"&client_id={UNSPLASH_ACCESS_KEY}"
        )
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        
        if "urls" in data:
            # Prefer regular size for better quality/performance balance
            return data["urls"].get("regular", "")
        logger.warning(f"No image URLs found for keyword: {keyword}")
    except requests.exceptions.RequestException as e:
        logger.error(f"Unsplash API Error: {str(e)}")
    except Exception as e:
        logger.error(f"Unexpected error in fetch_unsplash_image: {str(e)}")
    return ""


@app.route('/download_ppt', methods=['GET'])
def download_ppt():
    try:
        return send_file("generated_ppt.pptx", as_attachment=True)
    except Exception as e:
        logger.error(f"Error in download_ppt: {str(e)}")
        return jsonify({"error": "Failed to download presentation"}), 500

if __name__ == '__main__':
    app.run(debug=True)
