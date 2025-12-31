#!/usr/bin/env python3
"""
Telecom X - API Usage Example
Example of how to use the API connector

This example demonstrates:
1. Fetching customer data from API
2. Getting KPIs
3. Making predictions
4. Error handling
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))


def main():
    """Main example function"""
    print("=" * 80)
    print("TELECOM X - API Usage Example")
    print("=" * 80)
    print()
    
    try:
        from src.api.api_manager import APIManager
        
        # Initialize API manager
        print("Initializing API Manager...")
        api = APIManager(base_url="http://localhost:8000/api/v1")
        print("✓ API Manager initialized")
        print()
        
        # Example 1: Get all customers
        print("Example 1: Fetching all customers...")
        customers = api.get_customers(limit=10)
        print(f"✓ Retrieved {len(customers)} customers")
        if customers:
            print(f"  First customer: {customers[0]['customerID']}")
        print()
        
        # Example 2: Get specific customer
        print("Example 2: Fetching specific customer...")
        customer_id = "CUST-001"
        customer = api.get_customer(customer_id)
        if customer:
            print(f"✓ Customer {customer_id}:")
            print(f"  Gender: {customer.get('gender')}")
            print(f"  Tenure: {customer.get('tenure')} months")
            print(f"  Monthly Charges: ${customer.get('MonthlyCharges'):.2f}")
        print()
        
        # Example 3: Get KPIs
        print("Example 3: Fetching KPIs...")
        kpis = api.get_kpis()
        if kpis:
            print("✓ KPIs Retrieved:")
            print(f"  Total Customers: {kpis.get('totalCustomers')}")
            print(f"  Churn Rate: {kpis.get('churnRate')}%")
            print(f"  Retention Rate: {kpis.get('retentionRate')}%")
            print(f"  Avg Monthly Charges: ${kpis.get('avgMonthlyCharges'):.2f}")
        print()
        
        # Example 4: Make prediction
        print("Example 4: Making churn prediction...")
        customer_data = {
            'customerID': 'CUST-999',
            'tenure': 12,
            'MonthlyCharges': 65.50,
            'TotalCharges': 786.00,
            'Contract': 'Month-to-month'
        }
        
        prediction = api.predict_churn(customer_data)
        if prediction:
            print("✓ Prediction Results:")
            print(f"  Customer: {prediction.get('customerID')}")
            print(f"  Churn Prediction: {prediction.get('churnPrediction')}")
            print(f"  Probability: {prediction.get('churnProbability') * 100:.1f}%")
            print(f"  Risk Score: {prediction.get('riskScore')}/100")
        print()
        
        # Example 5: Search customers
        print("Example 5: Searching customers...")
        search_params = {
            'segment': 'Premium',
            'churn': 'No',
            'minTenure': 24
        }
        
        results = api.search_customers(search_params)
        print(f"✓ Found {len(results)} customers matching criteria")
        print()
        
        print("=" * 80)
        print("API Usage Example Completed!")
        print("=" * 80)
        
    except ConnectionError as e:
        print(f"✗ Connection Error: {str(e)}")
        print("  Make sure the API server is running")
        return 1
    except Exception as e:
        print(f"✗ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return 1
    
    return 0


if __name__ == "__main__":
    sys.exit(main())
