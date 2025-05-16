from flask import Blueprint, request, jsonify, render_template, send_from_directory
from werkzeug.utils import secure_filename
import os
import cv2
import time
from app import db
from app.utils.face_swap import perform_face_swap
from app.utils.face_detection import detect_faces

bp = Blueprint('bridal', __name__)

@bp.route('/bridal-swap', methods=['GET', 'POST'])
def bridal_swap():
    if request.method == 'GET':
        return render_template('bridal_swap.html')
    
    if 'source' not in request.files:
        return jsonify({'error': 'No source file provided'}), 400
    
    source_file = request.files['source']
    if not source_file.filename:
        return jsonify({'error': 'No selected file'}), 400
    
    try:
        # Create uploads directory if it doesn't exist
        upload_dir = os.path.join('templates', 'uploads', 'sources')
        os.makedirs(upload_dir, exist_ok=True)
        
        # Save the source file temporarily with a unique name
        timestamp = int(time.time())
        source_filename = f"source_{timestamp}_{secure_filename(source_file.filename)}"
        source_path = os.path.join(upload_dir, source_filename)
        source_file.save(source_path)
        
        # Get template paths
        is_multi_request = request.form.get('multi') == 'true'
        if is_multi_request:
            template_paths = request.form.getlist('templates[]')
        else:
            template_path = request.form.get('template_path')
            if not template_path:
                return jsonify({'error': 'No template path provided'}), 400
            template_paths = [template_path]
        
        # Process each template
        results = []
        for template_path in template_paths:
            try:
                # Read images
                source_img = cv2.imread(source_path)
                template_img = cv2.imread(template_path)
                
                if source_img is None or template_img is None:
                    continue
                
                # Detect faces
                source_faces = detect_faces(source_img)
                template_faces = detect_faces(template_img)
                
                if not source_faces or not template_faces:
                    continue
                
                # Perform face swap
                result_img = perform_face_swap(source_img, template_img, source_faces[0], template_faces[0])
                
                # Create results directory if it doesn't exist
                results_dir = os.path.join('static', 'results')
                os.makedirs(results_dir, exist_ok=True)
                
                # Save result
                result_filename = f"result_{timestamp}_{os.path.basename(template_path)}"
                result_path = os.path.join(results_dir, result_filename)
                cv2.imwrite(result_path, result_img)
                
                results.append({
                    'result_image': f'/static/results/{result_filename}',
                    'template_path': template_path
                })
                
            except Exception as e:
                current_app.logger.error(f"Error processing template {template_path}: {str(e)}")
                continue
        
        if not results:
            return jsonify({'error': 'Failed to process any templates'}), 400
        
        return jsonify({
            'success': True,
            'results': results
        })
        
    except Exception as e:
        current_app.logger.error(f"Error in bridal-swap: {str(e)}")
        return jsonify({'error': str(e)}), 500
    finally:
        # Clean up temporary files
        if 'source_path' in locals() and os.path.exists(source_path):
            try:
                os.remove(source_path)
            except Exception as cleanup_error:
                current_app.logger.error(f"Error cleaning up source file: {str(cleanup_error)}")

@bp.route('/bridal-multi-swap', methods=['GET'])
def bridal_multi_swap():
    return render_template('bridal_multi_swap.html')

@bp.route('/bridal_results')
def bridal_results():
    return render_template('bridal_results.html')

@bp.route('/bridal-gallery')
def bridal_gallery():
    return render_template('bridal_gallery.html')

@bp.route('/bridal-outfits')
def bridal_outfits():
    return render_template('bridal_outfits.html') 