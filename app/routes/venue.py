from flask import Blueprint, render_template, request, jsonify

bp = Blueprint('venue', __name__)

@bp.route('/venue-search')
def venue_search():
    return render_template('venue/search.html')

@bp.route('/hall-comparison')
def hall_comparison():
    return render_template('venue/comparison.html')

@bp.route('/virtual-tours')
def virtual_tours():
    return render_template('venue/tours.html')

@bp.route('/booking-management')
def booking_management():
    return render_template('venue/booking.html')

@bp.route('/api/venue/categories')
def get_categories():
    categories = {
        'venue': {
            'types': ['Wedding Hall', 'Garden', 'Beach', 'Hotel'],
            'features': ['Indoor', 'Outdoor', 'Pool', 'Garden'],
            'capacity': ['Small (50-100)', 'Medium (100-300)', 'Large (300+)']
        }
    }
    return jsonify(categories) 