import os
import joblib
# import tensorflow as tf # Import locally if heavy
from tensorflow import keras
import logging

logger = logging.getLogger(__name__)

# Global dictionary to store loaded models (singleton)
MODELS = {}

def load_all_models():
    """Load all ML models at startup"""
    # Assuming code run from root context
    models_dir = os.path.join(os.getcwd(), 'app', 'ml_models')
    
    try:
        # 1. Screening Random Forest
        rf_path = os.path.join(models_dir, 'screening_rf.pkl')
        if os.path.exists(rf_path):
            MODELS['screening_rf'] = joblib.load(rf_path)
            logger.info("✓ Screening Random Forest loaded")
        else:
            logger.warning(f"⚠ screening_rf.pkl not found at {rf_path}, using placeholder")
            MODELS['screening_rf'] = None
        
        # 2. Screening MLP
        mlp_path = os.path.join(models_dir, 'screening_mlp.h5')
        if os.path.exists(mlp_path):
            MODELS['screening_mlp'] = keras.models.load_model(mlp_path)
            logger.info("✓ Screening MLP loaded")
        else:
            MODELS['screening_mlp'] = None
        
        # 3. Cognitive Load Decision Tree
        tree_path = os.path.join(models_dir, 'cognitive_load_tree.pkl')
        if os.path.exists(tree_path):
            MODELS['cognitive_load_tree'] = joblib.load(tree_path)
            logger.info("✓ Cognitive Load Decision Tree loaded")
        else:
            MODELS['cognitive_load_tree'] = None
        
        # 4. LSTM Attention
        lstm_path = os.path.join(models_dir, 'lstm_attention.h5')
        if os.path.exists(lstm_path):
            MODELS['lstm_attention'] = keras.models.load_model(lstm_path)
            logger.info("✓ LSTM Attention model loaded")
        else:
            MODELS['lstm_attention'] = None
        
    except Exception as e:
        logger.error(f"Error loading models: {e}")
        # Not raising error to allow service to start in dev mode
        pass

def get_model(model_name: str):
    """Get a loaded model by name"""
    return MODELS.get(model_name)
