"""
Face enhancement module for improving face quality after face swap.

This module provides face enhancement functionality using multiple models:
1. CodeFormer - For detailed face restoration
2. GFPGAN - For realistic face restoration

Both models are optional and the module will use whichever is available.
"""

import os
import logging
import cv2
import numpy as np
import onnxruntime as ort

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class FaceEnhancer:
    """
    Face enhancement class that supports multiple models for improving face quality
    after face swapping.
    """
    
    def __init__(self):
        """Initialize the face enhancer with available models."""
        self.codeformer_model = None
        self.codeformer_session = None
        self.gfpgan_model = None
        self.gfpgan_session = None
        
        # Model paths - check multiple possible locations
        self.model_dirs = [
            'models',
            os.path.join(os.path.dirname(__file__), 'models'),
            '/home/runner/workspace/models',
            '.'
        ]
        
        # Load available enhancement models
        self._load_models()

    def _load_models(self):
        """Load available enhancement models."""
        # Try to load CodeFormer
        codeformer_filenames = [
            'codeformer.onnx', 
            'faster_codeformer_onnx.onnx',
            'codeformer_fp16.onnx'
        ]
        
        for model_dir in self.model_dirs:
            for filename in codeformer_filenames:
                codeformer_path = os.path.join(model_dir, filename)
                if os.path.exists(codeformer_path):
                    try:
                        logger.info(f"Loading CodeFormer model from {codeformer_path}")
                        self.codeformer_model = codeformer_path
                        self.codeformer_session = ort.InferenceSession(
                            codeformer_path, 
                            providers=['CPUExecutionProvider']
                        )
                        logger.info("CodeFormer model loaded successfully")
                        break
                    except Exception as e:
                        logger.error(f"Failed to load CodeFormer model: {str(e)}")
                        self.codeformer_model = None
                        self.codeformer_session = None
            
            if self.codeformer_session is not None:
                break
                
        # Try to load GFPGAN
        gfpgan_filenames = [
            'gfpgan_1.4.onnx',
            'gfpgan.onnx',
            'GFPGANv1.4.onnx'
        ]
        
        for model_dir in self.model_dirs:
            for filename in gfpgan_filenames:
                gfpgan_path = os.path.join(model_dir, filename)
                if os.path.exists(gfpgan_path):
                    try:
                        logger.info(f"Loading GFPGAN model from {gfpgan_path}")
                        self.gfpgan_model = gfpgan_path
                        self.gfpgan_session = ort.InferenceSession(
                            gfpgan_path, 
                            providers=['CPUExecutionProvider']
                        )
                        logger.info("GFPGAN model loaded successfully")
                        break
                    except Exception as e:
                        logger.error(f"Failed to load GFPGAN model: {str(e)}")
                        self.gfpgan_model = None
                        self.gfpgan_session = None
            
            if self.gfpgan_session is not None:
                break

        if not self.has_enhancement_models():
            logger.warning("No face enhancement models were loaded. Only basic enhancement will be available.")

    def has_enhancement_models(self):
        """Check if any enhancement models are available."""
        return self.codeformer_session is not None or self.gfpgan_session is not None

    def preprocess(self, img):
        """Preprocess image for model input."""
        # Convert BGR to RGB if needed (models expect RGB)
        if img.shape[2] == 3:
            img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        else:
            img_rgb = img
            
        # Resize to model input size
        if self.codeformer_session is not None:
            # Get input shape from model
            input_shape = self.codeformer_session.get_inputs()[0].shape
            if len(input_shape) == 4:  # [batch_size, channels, height, width]
                height, width = input_shape[2], input_shape[3]
            else:
                # Default to 512x512 if shape information is not available
                height, width = 512, 512
        elif self.gfpgan_session is not None:
            # Get input shape from model
            input_shape = self.gfpgan_session.get_inputs()[0].shape
            if len(input_shape) == 4:  # [batch_size, channels, height, width]
                height, width = input_shape[2], input_shape[3]
            else:
                # Default to 512x512 if shape information is not available
                height, width = 512, 512
        else:
            # Default to 512x512 if no models are available
            height, width = 512, 512
        
        # Resize image
        img_resized = cv2.resize(img_rgb, (width, height))
        
        # Normalize pixel values to [0, 1]
        img_norm = img_resized.astype(np.float32) / 255.0
        
        # Transpose from HWC to CHW (Height, Width, Channels) -> (Channels, Height, Width)
        img_chw = img_norm.transpose(2, 0, 1)
        
        # Add batch dimension
        img_batch = np.expand_dims(img_chw, 0)
        
        return img_batch, img.shape[:2]

    def postprocess(self, output, original_shape):
        """Convert model output back to image."""
        # Remove batch dimension and transpose back to HWC
        if len(output.shape) == 4:
            img = output[0].transpose(1, 2, 0)
        else:
            img = output.transpose(1, 2, 0)
        
        # Denormalize to [0, 255]
        img = (img * 255.0).clip(0, 255).astype(np.uint8)
        
        # Convert back to BGR if needed
        img_bgr = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
        
        # Resize back to original shape
        img_resized = cv2.resize(img_bgr, (original_shape[1], original_shape[0]))
        
        return img_resized

    def enhance_with_codeformer(self, img, strength=0.7):
        """Enhance face using CodeFormer model."""
        if self.codeformer_session is None:
            logger.warning("CodeFormer model not loaded. Cannot enhance with CodeFormer.")
            return img
        
        try:
            # Preprocess image
            input_tensor, original_shape = self.preprocess(img)
            
            # Get input and output names
            input_name = self.codeformer_session.get_inputs()[0].name
            output_name = self.codeformer_session.get_outputs()[0].name
            
            # Run inference
            outputs = self.codeformer_session.run([output_name], {input_name: input_tensor})
            enhanced_img = outputs[0]
            
            # Postprocess result
            result = self.postprocess(enhanced_img, original_shape)
            
            # Blend with original based on strength
            if strength < 1.0:
                result = cv2.addWeighted(img, 1 - strength, result, strength, 0)
            
            return result
        except Exception as e:
            logger.error(f"CodeFormer enhancement failed: {str(e)}")
            return img

    def enhance_with_gfpgan(self, img, strength=0.7):
        """Enhance face using GFPGAN model."""
        if self.gfpgan_session is None:
            logger.warning("GFPGAN model not loaded. Cannot enhance with GFPGAN.")
            return img
        
        try:
            # Preprocess image
            input_tensor, original_shape = self.preprocess(img)
            
            # Get input and output names
            input_name = self.gfpgan_session.get_inputs()[0].name
            output_name = self.gfpgan_session.get_outputs()[0].name
            
            # Run inference
            outputs = self.gfpgan_session.run([output_name], {input_name: input_tensor})
            enhanced_img = outputs[0]
            
            # Postprocess result
            result = self.postprocess(enhanced_img, original_shape)
            
            # Blend with original based on strength
            if strength < 1.0:
                result = cv2.addWeighted(img, 1 - strength, result, strength, 0)
            
            return result
        except Exception as e:
            logger.error(f"GFPGAN enhancement failed: {str(e)}")
            return img

    def enhance(self, img, method='auto', strength=0.7):
        """
        Enhance a face image using the best available method.
        
        Args:
            img (np.ndarray): Input image
            method (str): Enhancement method - 'codeformer', 'gfpgan', or 'auto'
            strength (float): Enhancement strength from 0.0 to 1.0
            
        Returns:
            np.ndarray: Enhanced image or original if enhancement failed
        """
        # Validate strength parameter
        strength = max(0.0, min(1.0, strength))
        
        # Choose enhancement method
        if method == 'codeformer' and self.codeformer_session is not None:
            logger.info("Enhancing with CodeFormer")
            return self.enhance_with_codeformer(img, strength)
        elif method == 'gfpgan' and self.gfpgan_session is not None:
            logger.info("Enhancing with GFPGAN")
            return self.enhance_with_gfpgan(img, strength)
        elif method == 'auto':
            # Use whichever model is available, prioritizing CodeFormer
            if self.codeformer_session is not None:
                logger.info("Auto-selected CodeFormer for enhancement")
                return self.enhance_with_codeformer(img, strength)
            elif self.gfpgan_session is not None:
                logger.info("Auto-selected GFPGAN for enhancement")
                return self.enhance_with_gfpgan(img, strength)
            else:
                logger.warning("No enhancement models available. Using basic enhancement.")
                return self._basic_enhance(img)
        else:
            logger.warning(f"Unknown enhancement method '{method}'. Using basic enhancement.")
            return self._basic_enhance(img)

    def _basic_enhance(self, img):
        """
        Apply basic image enhancements when no models are available.
        """
        try:
            # Convert to LAB color space for better processing
            lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
            
            # Split the LAB image to L, A and B channels
            l, a, b = cv2.split(lab)
            
            # Apply CLAHE to L channel
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
            cl = clahe.apply(l)
            
            # Merge the CLAHE enhanced L channel with the A and B channels
            enhanced_lab = cv2.merge((cl, a, b))
            
            # Convert back to BGR color space
            enhanced_img = cv2.cvtColor(enhanced_lab, cv2.COLOR_LAB2BGR)
            
            # Slightly sharpen the image
            kernel = np.array([[-1, -1, -1], 
                              [-1, 9, -1], 
                              [-1, -1, -1]])
            enhanced_img = cv2.filter2D(enhanced_img, -1, kernel)
            
            return enhanced_img
        except Exception as e:
            logger.error(f"Basic enhancement failed: {str(e)}")
            return img
    
    def enhance_face(self, img, face_info=None, method='auto'):
        """
        Enhanced interface for face enhancement to maintain compatibility with different calling conventions.
        This is an alias that calls enhance() with the appropriate parameters.
        
        Args:
            img (np.ndarray): Input image
            face_info: Optional face information (not used in this implementation, but kept for API compatibility)
            method (str): Enhancement method - 'codeformer', 'gfpgan', or 'auto'
            
        Returns:
            tuple: (enhanced_image, success_flag) or just the enhanced image depending on the caller's expectation
        """
        # Apply the enhancement
        try:
            result_img = self.enhance(img, method=method)
            # Return format compatible with both calling conventions
            return result_img, True
        except Exception as e:
            logger.error(f"Face enhancement failed: {str(e)}")
            return img, False

# Initialize a global enhancer instance for convenient import
enhancer = FaceEnhancer()