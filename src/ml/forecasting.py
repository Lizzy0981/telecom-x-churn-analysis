"""
📈 Forecasting
=============

Autor: Elizabeth Díaz Familia
"""

import numpy as np

class Forecasting:
    """Pronósticos"""
    
    @staticmethod
    def simple_moving_average(data, window: int = 3):
        """Media móvil simple"""
        return np.convolve(data, np.ones(window)/window, mode='valid')
