from flask import Blueprint, render_template, request, jsonify
from app.models import EventManager

bp = Blueprint('salon', __name__)

@bp.route('/salon')
def salon():
    return render_template('salon.html')

@bp.route('/salon/men')
def men_salon():
    return render_template('salon/men.html')

@bp.route('/salon/women')
def women_salon():
    return render_template('salon/women.html')

@bp.route('/api/salon/categories')
def get_categories():
    categories = {
        'salon': {
            'men': {
                'Haircut Styles': ['Classic Cut', 'Modern Fade', 'Textured Crop'],
                'Beard Styles': ['Full Beard', 'Goatee', 'Stubble'],
                'Facial Styles': ['Deep Cleansing', 'Anti-Aging', 'Brightening'],
                'Grooming Styles': ['Hair Coloring', 'Hair Treatment', 'Styling']
            },
            'women': {
                'Haircut Styles': ['Layered Cut', 'Bob Cut', 'Pixie Cut'],
                'Hair Coloring': ['Highlights', 'Balayage', 'Ombre'],
                'Hair Styling': ['Curling', 'Straightening', 'Updo'],
                'Facial Styles': ['Hydrating', 'Anti-Aging', 'Brightening']
            }
        }
    }
    return jsonify(categories) 