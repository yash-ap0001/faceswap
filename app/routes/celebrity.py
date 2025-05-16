from flask import Blueprint, render_template, request, jsonify

bp = Blueprint('celebrity', __name__)

@bp.route('/celebrity')
def celebrity():
    return render_template('celebrity.html')

@bp.route('/celebrity/men')
def celebrity_men():
    return render_template('celebrity/men.html')

@bp.route('/celebrity/women')
def celebrity_women():
    return render_template('celebrity/women.html')

@bp.route('/celebrity/tollywood')
def celebrity_tollywood():
    return render_template('celebrity/tollywood.html')

@bp.route('/celebrity/bollywood')
def celebrity_bollywood():
    return render_template('celebrity/bollywood.html')

@bp.route('/api/celebrity/categories')
def get_categories():
    categories = {
        'celebrity': {
            'men': ['Hollywood', 'Bollywood', 'Tollywood'],
            'women': ['Hollywood', 'Bollywood', 'Tollywood'],
            'tollywood': ['Actors', 'Actresses', 'Directors'],
            'bollywood': ['Actors', 'Actresses', 'Directors']
        }
    }
    return jsonify(categories) 