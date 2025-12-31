"""
Setup configuration for Telecom X - Customer Churn Analysis

This allows the package to be installed via pip:
    pip install -e .
    
or
    pip install .

Author: Elizabeth Díaz Familia
License: MIT
"""

from setuptools import setup, find_packages
from pathlib import Path

# Read the README file
this_directory = Path(__file__).parent
long_description = (this_directory / "README.md").read_text(encoding='utf-8')

# Read requirements
requirements = []
try:
    with open('requirements.txt', 'r') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#'):
                requirements.append(line)
except FileNotFoundError:
    pass

setup(
    name="telecom-x-churn-analysis",
    version="1.0.0",
    author="Elizabeth Díaz Familia",
    author_email="lizzyfamilia@gmail.com",
    description="Sistema completo de análisis de churn para empresas de telecomunicaciones",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/Lizzy0981/telecom-x-churn-analysis",
    project_urls={
        "Bug Tracker": "https://github.com/Lizzy0981/telecom-x-churn-analysis/issues",
        "Documentation": "https://github.com/Lizzy0981/telecom-x-churn-analysis#readme",
        "Source Code": "https://github.com/Lizzy0981/telecom-x-churn-analysis",
        "LinkedIn": "https://linkedin.com/in/eli-familia/",
    },
    packages=find_packages(where="."),
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "Intended Audience :: Science/Research",
        "Topic :: Scientific/Engineering :: Artificial Intelligence",
        "Topic :: Scientific/Engineering :: Information Analysis",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
        "Operating System :: OS Independent",
        "Natural Language :: Spanish",
        "Natural Language :: English",
        "Natural Language :: Portuguese",
        "Natural Language :: French",
        "Natural Language :: Arabic",
        "Natural Language :: Hebrew",
        "Natural Language :: Chinese (Simplified)",
    ],
    python_requires=">=3.8",
    install_requires=[
        "pandas>=2.2.0",
        "numpy>=1.26.0",
        "scipy>=1.11.0",
        "plotly>=5.18.0",
        "matplotlib>=3.8.0",
        "seaborn>=0.13.0",
        "scikit-learn>=1.4.0",
        "openpyxl>=3.1.0",
        "reportlab>=4.0.0",
        "requests>=2.31.0",
        "tqdm>=4.66.0",
        "deep-translator>=1.11.0",
    ],
    extras_require={
        "dev": [
            "pytest>=7.4.0",
            "pytest-cov>=4.1.0",
            "black>=23.12.0",
            "flake8>=6.1.0",
            "mypy>=1.7.0",
            "jupyter>=1.0.0",
            "notebook>=7.0.0",
        ],
        "notebooks": [
            "jupyter>=1.0.0",
            "notebook>=7.0.0",
            "ipykernel>=6.27.0",
            "ipywidgets>=8.1.0",
        ],
        "database": [
            "sqlalchemy>=2.0.0",
            "psycopg2-binary>=2.9.0",
            "pymongo>=4.6.0",
        ],
    },
    entry_points={
        "console_scripts": [
            "telecom-x=src.etl.pipeline:main",
        ],
    },
    include_package_data=True,
    package_data={
        "": [
            "translations/*.json",
            "config/*.json",
            "config/*.template.json",
        ],
    },
    keywords=[
        "churn analysis",
        "customer churn",
        "telecommunications",
        "data analysis",
        "machine learning",
        "data science",
        "business intelligence",
        "customer analytics",
        "predictive analytics",
        "ETL pipeline",
    ],
    zip_safe=False,
)
