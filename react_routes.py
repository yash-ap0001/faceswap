"""
React application routes and API endpoints.
These routes serve the React application and provide API endpoints for it.
"""

import json
import time
from flask import Blueprint, render_template, jsonify, request

# Create a blueprint for React app routes
react_bp = Blueprint('react', __name__, url_prefix='/react')

# Create a blueprint for React API endpoints
api_bp = Blueprint('api', __name__, url_prefix='/api')

@react_bp.route('/')
@react_bp.route('')
@react_bp.route('/<path:path>')  # Catch-all route for all React routes
def react_app(path=None):
    """
    Render the React application using the React index template.
    This serves as the entry point for the SPA (Single Page Application).
    The catch-all route ensures all React routes are handled by the SPA.
    """
    return render_template('react/index.html')

@api_bp.route('/menu')
def api_menu():
    """
    API endpoint to get the menu structure for the React sidebar.
    Returns a JSON object with the menu structure.
    
    This endpoint includes a cache-busting timestamp to ensure clients always get the latest menu.
    """
    # Add cache-busting headers
    response = jsonify({
        "menu": get_menu_structure(),
        "timestamp": int(time.time() * 1000)  # Current time in milliseconds
    })
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    return response

def get_menu_structure():
    """Helper function to get the menu structure."""
    menu = [
        {
            "id": "face-swap",
            "title": "Face Swap",
            "icon": "fa-exchange-alt",
            "subItems": [
                {"id": "face-swap-page", "label": "Face Swap", "link": "/universal"}
            ]
        },
        {
            "id": "bride",
            "title": "Bride",
            "icon": "fa-female",
            "subItems": [
                {"id": "bridal-gallery", "label": "Bridal Gallery", "link": "/react#bridal-gallery"},
                {"id": "bridal-swap", "label": "Create Bride Look", "link": "/react#bridal-swap"},
                {"id": "outfits-for-girls", "label": "Outfits for Girls", "link": "/react#outfits-for-girls"},
                {"id": "jewelry-collections", "label": "Jewelry Collections", "link": "/react#jewelry-collections"},
                {"id": "makeup-styles", "label": "Makeup Styles", "link": "/react#makeup-styles"}
            ]
        },
        {
            "id": "groom",
            "title": "Groom",
            "icon": "fa-male",
            "subItems": [
                {"id": "groom-face-swap", "label": "Create Groom Look", "link": "/react#groom-face-swap"},
                {"id": "traditional-wear", "label": "Traditional Wear", "link": "/react#traditional-wear"},
                {"id": "modern-suits", "label": "Modern Suits", "link": "/react#modern-suits"},
                {"id": "groom-accessories", "label": "Accessories", "link": "/react#groom-accessories"}
            ]
        },
        {
            "id": "saloons",
            "title": "Saloons",
            "icon": "fa-cut",
            "subItems": [
                {"id": "bride-saloons", "label": "Bride Saloons", "link": "/react#bride-saloons"},
                {"id": "groom-saloons", "label": "Groom Saloons", "link": "/react#groom-saloons"},
                {"id": "makeup-artists", "label": "Makeup Artists", "link": "/react#makeup-artists"},
                {"id": "saloon-packages", "label": "Saloon Packages", "link": "/react#saloon-packages"}
            ]
        },
        {
            "id": "services",
            "title": "Services",
            "icon": "fa-concierge-bell",
            "subItems": [
                {"id": "venue-search", "label": "Venue Search", "link": "/react#venue-search"},
                {"id": "catering-list", "label": "Catering List", "link": "/react#catering-list"},
                {"id": "event-managers", "label": "Event Managers", "link": "/react#event-managers"},
                {"id": "photographers", "label": "Photographers", "link": "/react#photographers"}
            ]
        },
        {
            "id": "settings",
            "title": "Settings",
            "icon": "fa-cog",
            "subItems": [
                {"id": "all-categories", "label": "All Categories", "link": "/react#all-categories"},
                {"id": "bulk-upload", "label": "Bulk Upload Templates", "link": "/bulk-upload"}
            ]
        }
    ]
    
    return menu

@api_bp.route('/fallback/templates')
def fallback_templates():
    """
    API endpoint to provide fallback templates when the main template
    fetching mechanism fails. This ensures the React app has content
    to display during development and testing.
    
    Query parameters:
    - ceremony_type: Type of ceremony (haldi, mehendi, sangeeth, wedding, reception)
    - category_type: Type of category (bride, groom)
    - subcategory: Subcategory (bridal, outfits, etc.)
    - item_category: Specific item category
    """
    # Get query parameters
    ceremony_type = request.args.get('ceremony_type')
    category_type = request.args.get('category_type', 'bride')
    subcategory = request.args.get('subcategory', 'bridal')
    item_category = request.args.get('item_category', ceremony_type)
    
    # If no ceremony or item category specified, return error
    if not (ceremony_type or item_category):
        return jsonify({'success': False, 'message': 'No ceremony or item category specified'}), 400
    
    # Use ceremony type as item category if not specified
    item_category = item_category or ceremony_type
    
    # Create fallback templates based on static files in static/images/templates
    fallback_templates = []
    
    # Generate 6 placeholder templates
    for i in range(1, 7):
        template_id = f"{item_category}_{i}"
        template_path = f"static/images/templates/{item_category}/{i}.jpg"
        template_url = f"/static/images/templates/{item_category}/{i}.jpg"
        
        fallback_templates.append({
            "id": template_id,
            "path": template_path,
            "url": template_url,
            "category_type": category_type,
            "subcategory": subcategory,
            "item_category": item_category,
            "template_type": "fallback"
        })
    
    # Return the fallback templates
    return jsonify({
        "success": True,
        "templates": fallback_templates,
        "count": len(fallback_templates),
        "has_templates": len(fallback_templates) > 0,
        "category_type": category_type,
        "subcategory": subcategory,
        "item_category": item_category
    })

@api_bp.route('/content/<page_id>')
def api_content(page_id):
    """
    API endpoint to get the content for a specific page.
    This allows the React app to fetch page content without full page reloads.
    
    Args:
        page_id: The ID of the page to fetch
        
    Returns:
        JSON object with the page content
    """
    # Simple content mapping for basic pages
    content_map = {
        "home": {
            "title": "Welcome to VOWBRIDE",
            "content": "<p>Transform your wedding planning experience with our AI-powered platform.</p>",
            "cta": {"text": "Start Exploring", "link": "/react#bridal-gallery"}
        },
        "outfits-for-girls": {
            "title": "Outfits for Girls",
            "content": "<p>Browse our collection of modern and traditional outfits for girls.</p>"
        },
        "jewelry-collections": {
            "title": "Jewelry Collections",
            "content": "<p>Explore our jewelry collections for different ceremonies.</p>"
        },
        "makeup-styles": {
            "title": "Makeup Styles",
            "content": "<p>Discover makeup styles for different ceremonies and looks.</p>"
        },
        "traditional-wear": {
            "title": "Traditional Wear",
            "content": "<p>Browse traditional wear for grooms.</p>"
        },
        "modern-suits": {
            "title": "Modern Suits",
            "content": "<p>Explore modern suits and formal wear for grooms.</p>"
        },
        "groom-accessories": {
            "title": "Groom Accessories",
            "content": "<p>Browse accessories for grooms.</p>"
        },
        "venue-search": {
            "title": "Venue Search",
            "content": "<p>Find the perfect venue for your wedding.</p>"
        },
        "catering-list": {
            "title": "Catering List",
            "content": "<p>Explore top catering services for your wedding.</p>"
        },
        "photographers": {
            "title": "Photographers",
            "content": "<p>Find professional photographers for your wedding.</p>"
        },
        "event-managers": {
            "title": "Event Managers",
            "content": "<p>Find event managers for your wedding.</p>"
        },
        "bride-saloons": {
            "title": "Bride Saloons",
            "content": "<p>Browse saloons specializing in bridal makeup and styling.</p>"
        },
        "groom-saloons": {
            "title": "Groom Saloons",
            "content": "<p>Browse saloons specializing in groom styling and grooming.</p>"
        },
        "makeup-artists": {
            "title": "Makeup Artists",
            "content": "<p>Find professional makeup artists for your wedding.</p>"
        },
        "saloon-packages": {
            "title": "Saloon Packages",
            "content": "<p>Explore comprehensive saloon packages for the bride and groom.</p>"
        }
    }
    
    # Default response for unknown page IDs
    default_content = {
        "title": "Page Not Found",
        "content": "<p>The requested page does not exist.</p>"
    }
    
    # Return content for requested page or default content
    return jsonify(content_map.get(page_id, default_content))

@api_bp.route('/categories')
def api_categories():
    """
    API endpoint to get the full categories structure.
    Returns a JSON object with all categories, subcategories, and items.
    """
    try:
        with open('static/data/categories.json', 'r') as f:
            categories_data = json.load(f)
        return jsonify(categories_data)
    except FileNotFoundError:
        return jsonify({"error": "Categories data not found", "success": False}), 404
    except Exception as e:
        return jsonify({"error": str(e), "success": False}), 500