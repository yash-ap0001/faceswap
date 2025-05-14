"""
React application routes and API endpoints.
These routes serve the React application and provide API endpoints for it.
"""

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
    Render the React application using the layout template.
    This serves as the entry point for the SPA (Single Page Application).
    The catch-all route ensures all React routes are handled by the SPA.
    """
    return render_template('layout.html')

@api_bp.route('/menu')
def api_menu():
    """
    API endpoint to get the menu structure for the React sidebar.
    Returns a JSON object with the menu structure.
    """
    menu = [
        {
            "id": "home",
            "title": "Home",
            "icon": "fa-home",
            "subItems": [
                {"id": "home", "label": "Home", "link": "/react"}
            ]
        },
        {
            "id": "bride",
            "title": "Bride",
            "icon": "fa-female",
            "subItems": [
                {"id": "bridal-gallery", "label": "Bridal Gallery", "link": "/react#bridal-gallery"},
                {"id": "bridal-swap", "label": "Create Bride Look", "link": "/react#bridal-swap"},
                {"id": "bridal-outfits", "label": "Bridal Outfits", "link": "/react#bridal-outfits"},
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
            "id": "services",
            "title": "Services",
            "icon": "fa-concierge-bell",
            "subItems": [
                {"id": "venue-search", "label": "Venue Search", "link": "/react#venue-search"},
                {"id": "hall-comparison", "label": "Hall Comparison", "link": "/react#hall-comparison"},
                {"id": "virtual-tours", "label": "Virtual Tours", "link": "/react#virtual-tours"},
                {"id": "booking-management", "label": "Booking Management", "link": "/react#booking-management"},
                {"id": "saloons", "label": "Saloons", "link": "/react#saloons"},
                {"id": "event-managers", "label": "Event Managers", "link": "/react#event-managers"}
            ]
        }
    ]
    
    return jsonify({"menu": menu})

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
        "bridal-outfits": {
            "title": "Bridal Outfits",
            "content": "<p>Browse our collection of modern and traditional bridal outfits.</p>"
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
        "hall-comparison": {
            "title": "Hall Comparison",
            "content": "<p>Compare different wedding halls side by side.</p>"
        },
        "virtual-tours": {
            "title": "Virtual Tours",
            "content": "<p>Take virtual tours of wedding venues.</p>"
        },
        "booking-management": {
            "title": "Booking Management",
            "content": "<p>Manage your venue bookings.</p>"
        },
        "saloons": {
            "title": "Saloons",
            "content": "<p>Browse saloons and makeup artists for wedding preparation.</p>"
        },
        "event-managers": {
            "title": "Event Managers",
            "content": "<p>Find event managers for your wedding.</p>"
        }
    }
    
    # Default response for unknown page IDs
    default_content = {
        "title": "Page Not Found",
        "content": "<p>The requested page does not exist.</p>"
    }
    
    # Return content for requested page or default content
    return jsonify(content_map.get(page_id, default_content))