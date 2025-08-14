import streamlit as st
import pandas as pd
import os
from datetime import datetime
import json
from typing import Optional, Dict, List
import sys

# Configure Streamlit page
st.set_page_config(
    page_title="AESA Squadron 72 Inventory Management",
    page_icon="🛡️",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Custom CSS for AESA Squadron theming - matches original React app
st.markdown("""
<style>
    /* Main app styling */
    .stApp {
        background-color: #0f172a;
        color: #f8fafc;
    }
    
    /* Header styling */
    .main-header {
        background: linear-gradient(90deg, #1e293b, #334155);
        padding: 1rem;
        border-radius: 0.5rem;
        margin-bottom: 2rem;
        color: white;
        border: 1px solid #475569;
    }
    
    /* Status badges matching original */
    .status-missing { 
        background-color: #fef2f2; 
        color: #dc2626; 
        padding: 0.25rem 0.75rem; 
        border-radius: 0.375rem;
        font-weight: 600;
        font-size: 0.875rem;
        display: inline-block;
    }
    .status-complete { 
        background-color: #f0fdf4; 
        color: #16a34a; 
        padding: 0.25rem 0.75rem; 
        border-radius: 0.375rem;
        font-weight: 600;
        font-size: 0.875rem;
        display: inline-block;
    }
    .status-verified { 
        background-color: #eff6ff; 
        color: #2563eb; 
        padding: 0.25rem 0.75rem; 
        border-radius: 0.375rem;
        font-weight: 600;
        font-size: 0.875rem;
        display: inline-block;
    }
    .status-returned { 
        background-color: #faf5ff; 
        color: #7c3aed; 
        padding: 0.25rem 0.75rem; 
        border-radius: 0.375rem;
        font-weight: 600;
        font-size: 0.875rem;
        display: inline-block;
    }
    
    /* Card styling */
    .stContainer > div {
        background-color: #1e293b;
        border: 1px solid #334155;
        border-radius: 0.5rem;
        padding: 1rem;
        margin: 0.5rem 0;
    }
    
    /* Button styling */
    .stButton > button {
        background-color: #3b82f6;
        color: white;
        border: none;
        border-radius: 0.375rem;
        font-weight: 500;
    }
    
    .stButton > button:hover {
        background-color: #2563eb;
    }
    
    /* Admin section */
    .admin-section { 
        border: 2px solid #3b82f6; 
        padding: 1.5rem; 
        border-radius: 0.5rem; 
        background-color: #1e293b;
        margin: 1rem 0;
    }
    
    /* Survey button */
    .survey-button {
        background-color: #059669 !important;
        color: white !important;
        font-weight: 600 !important;
        padding: 0.75rem 1.5rem !important;
        border-radius: 0.375rem !important;
    }
    
    /* Footer styling */
    .footer {
        border-top: 1px solid #334155;
        background-color: #1e293b;
        padding: 1rem;
        margin-top: 3rem;
        text-align: center;
        color: #94a3b8;
        font-size: 0.75rem;
    }
    
    /* Table styling */
    .stDataFrame {
        background-color: #1e293b;
    }
    
    /* Tab styling */
    .stTabs [data-baseweb="tab-list"] {
        background-color: #334155;
        border-radius: 0.5rem;
    }
    
    .stTabs [data-baseweb="tab"] {
        color: #94a3b8;
        background-color: transparent;
    }
    
    .stTabs [aria-selected="true"] {
        background-color: #1e293b;
        color: #3b82f6;
    }
</style>
""", unsafe_allow_html=True)

# Initialize session state
# Initialize session state - matching original React app state
if "authenticated" not in st.session_state:
    st.session_state.authenticated = False
if "inventory_data" not in st.session_state:
    st.session_state.inventory_data = []
if "pending_requests" not in st.session_state:
    st.session_state.pending_requests = []
if "event_name" not in st.session_state:
    st.session_state.event_name = "AESA Squadron 72"
if "password_required" not in st.session_state:
    st.session_state.password_required = True
if "survey_enabled" not in st.session_state:
    st.session_state.survey_enabled = False
if "show_cookie_consent" not in st.session_state:
    st.session_state.show_cookie_consent = True
if "use_mobile_view" not in st.session_state:
    st.session_state.use_mobile_view = False
if "show_survey_dialog" not in st.session_state:
    st.session_state.show_survey_dialog = False

# Sample inventory data for demonstration
SAMPLE_INVENTORY = [
    {"id": 1, "item": "Combat Helmet", "category": "Safety", "status": "complete", "requestor": "SSgt Johnson", "date_requested": "2025-01-10"},
    {"id": 2, "item": "Field Radio", "category": "Communications", "status": "missing", "requestor": "A1C Smith", "date_requested": "2025-01-11"},
    {"id": 3, "item": "Night Vision Goggles", "category": "Optics", "status": "verified", "requestor": "TSgt Davis", "date_requested": "2025-01-12"},
    {"id": 4, "item": "Body Armor", "category": "Protection", "status": "returned", "requestor": "SrA Wilson", "date_requested": "2025-01-13"},
    {"id": 5, "item": "Medical Kit", "category": "Medical", "status": "complete", "requestor": "MSgt Brown", "date_requested": "2025-01-14"},
]

if not st.session_state.inventory_data:
    st.session_state.inventory_data = SAMPLE_INVENTORY

def authenticate_user(password: str) -> bool:
    """Authenticate user with event password"""
    # In production, this would validate against a secure database
    return password == "squadron72" or password == "admin"

def authenticate_admin(password: str) -> bool:
    """Authenticate admin with master password"""
    return password == "Ku2023!@"

def render_header():
    """Render the application header"""
    st.markdown(f"""
    <div class="main-header">
        <div style="display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center;">
                <div style="background: #3b82f6; width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 1rem;">
                    🛡️
                </div>
                <div>
                    <h1 style="margin: 0; font-size: 1.5rem;">{st.session_state.event_name}</h1>
                    <p style="margin: 0; opacity: 0.8;">Inventory Management System</p>
                </div>
            </div>
            <div style="display: flex; align-items: center; gap: 1rem;">
                <div style="background: rgba(34, 197, 94, 0.2); padding: 0.5rem 1rem; border-radius: 0.5rem;">
                    <span style="color: #22c55e;">● System Online</span>
                </div>
                {f'<div style="background: rgba(59, 130, 246, 0.2); padding: 0.5rem 1rem; border-radius: 0.5rem;"><span style="color: #3b82f6;">🛡️ Admin Access</span></div>' if st.session_state.authenticated else ''}
            </div>
        </div>
    </div>
    """, unsafe_allow_html=True)

def render_request_form():
    """Render the equipment request form"""
    st.subheader("Request Equipment")
    
    with st.form("request_form"):
        col1, col2 = st.columns(2)
        
        with col1:
            requestor_name = st.text_input("Requestor Name", placeholder="Enter your name")
            item_name = st.text_input("Item Name", placeholder="Equipment requested")
            category = st.selectbox("Category", ["Safety", "Communications", "Optics", "Protection", "Medical", "Other"])
        
        with col2:
            priority = st.selectbox("Priority", ["Low", "Medium", "High", "Critical"])
            quantity = st.number_input("Quantity", min_value=1, value=1)
            justification = st.text_area("Justification", placeholder="Reason for request")
        
        submitted = st.form_submit_button("Submit Request", type="primary")
        
        if submitted:
            if requestor_name and item_name:
                new_request = {
                    "id": len(st.session_state.pending_requests) + 1,
                    "requestor": requestor_name,
                    "item": item_name,
                    "category": category,
                    "priority": priority,
                    "quantity": quantity,
                    "justification": justification,
                    "date_requested": datetime.now().strftime("%Y-%m-%d"),
                    "status": "pending"
                }
                st.session_state.pending_requests.append(new_request)
                st.success(f"Request submitted for {item_name}")
                st.rerun()
            else:
                st.error("Please fill in all required fields")

def render_inventory_table():
    """Render the inventory tracking table matching original design"""
    st.markdown('<div class="stContainer">', unsafe_allow_html=True)
    st.markdown("#### 📦 Inventory Status")
    
    if st.session_state.inventory_data:
        # Ensure we have a proper DataFrame
        try:
            df = pd.DataFrame(st.session_state.inventory_data)
        except Exception as e:
            st.error(f"Error loading inventory data: {str(e)}")
            return
        
        # Filter options
        col1, col2, col3 = st.columns(3)
        with col1:
            status_filter = st.selectbox("Filter by Status", ["All", "missing", "complete", "verified", "returned"])
        with col2:
            category_filter = st.selectbox("Filter by Category", ["All"] + list(set([item.get("category", "Unknown") for item in st.session_state.inventory_data])))
        with col3:
            search_term = st.text_input("Search Items", placeholder="Search by item name...")
        
        # Apply filters
        filtered_df = df.copy()
        if status_filter != "All":
            filtered_df = filtered_df[filtered_df["status"] == status_filter]
        if category_filter != "All":
            filtered_df = filtered_df[filtered_df["category"] == category_filter]
        if search_term:
            # Convert to string first to avoid pandas type issues
            try:
                # Ensure we have strings and filter safely
                item_series = filtered_df["item"].astype(str)
                mask = item_series.str.contains(search_term, case=False, na=False)
                filtered_df = filtered_df[mask]
            except Exception:
                # Fallback if string operations fail
                filtered_df = filtered_df
        
        # Display inventory data
        if len(filtered_df) > 0:
            # Use native pandas display for Streamlit Cloud compatibility
            st.dataframe(filtered_df, use_container_width=True)
            
            # Admin controls for status updates
            if st.session_state.authenticated:
                st.subheader("Admin Controls")
                item_to_update = st.selectbox("Select item to update:", 
                                              options=[(item["id"], item["item"]) for item in st.session_state.inventory_data],
                                              format_func=lambda x: x[1])
                
                if item_to_update:
                    current_item = next((item for item in st.session_state.inventory_data if item["id"] == item_to_update[0]), None)
                    if current_item:
                        new_status = st.selectbox("Update status:", 
                                                  ["missing", "complete", "verified", "returned"],
                                                  index=["missing", "complete", "verified", "returned"].index(current_item["status"]))
                        
                        if st.button("Update Status"):
                            current_item["status"] = new_status
                            st.success(f"Updated {current_item['item']} to {new_status}")
                            st.rerun()
        else:
            st.info("No items match the current filters")
    else:
        st.info("No inventory data available")
    
    st.markdown('</div>', unsafe_allow_html=True)

def render_admin_panel():
    """Render the admin control panel"""
    if not st.session_state.authenticated:
        st.warning("Admin access required")
        password = st.text_input("Enter admin password", type="password")
        if st.button("Authenticate"):
            if authenticate_admin(password):
                st.session_state.authenticated = True
                st.success("Admin authenticated")
                st.rerun()
            else:
                st.error("Invalid admin password")
        return
    
    st.subheader("Admin Control Panel")
    
    # Admin controls in expandable sections
    with st.expander("System Settings", expanded=True):
        col1, col2 = st.columns(2)
        
        with col1:
            new_event_name = st.text_input("Event Name", value=st.session_state.event_name)
            if st.button("Update Event Name"):
                st.session_state.event_name = new_event_name
                st.success("Event name updated")
                st.rerun()
        
        with col2:
            password_required = st.checkbox("Require Password for Access", value=st.session_state.password_required)
            if password_required != st.session_state.password_required:
                st.session_state.password_required = password_required
                st.success("Password requirement updated")
                st.rerun()
    
    with st.expander("Survey Management"):
        survey_enabled = st.checkbox("Enable Survey Button", value=st.session_state.survey_enabled)
        if survey_enabled != st.session_state.survey_enabled:
            st.session_state.survey_enabled = survey_enabled
            st.success("Survey setting updated")
            st.rerun()
    
    with st.expander("Inventory Management"):
        st.write("**Add New Inventory Item**")
        
        with st.form("add_inventory"):
            col1, col2, col3 = st.columns(3)
            with col1:
                new_item = st.text_input("Item Name")
                new_category = st.selectbox("Category", ["Safety", "Communications", "Optics", "Protection", "Medical", "Other"])
            with col2:
                new_status = st.selectbox("Initial Status", ["missing", "complete", "verified", "returned"])
                new_requestor = st.text_input("Requestor")
            with col3:
                if st.form_submit_button("Add Item"):
                    if new_item:
                        new_id = max([item["id"] for item in st.session_state.inventory_data], default=0) + 1
                        new_inventory_item = {
                            "id": new_id,
                            "item": new_item,
                            "category": new_category,
                            "status": new_status,
                            "requestor": new_requestor,
                            "date_requested": datetime.now().strftime("%Y-%m-%d")
                        }
                        st.session_state.inventory_data.append(new_inventory_item)
                        st.success(f"Added {new_item} to inventory")
                        st.rerun()
        
        # Reset inventory
        if st.button("Reset All Inventory Data", type="secondary"):
            if st.checkbox("Confirm reset (this cannot be undone)"):
                st.session_state.inventory_data = SAMPLE_INVENTORY.copy()
                st.session_state.pending_requests = []
                st.success("Inventory data reset")
                st.rerun()

def render_pending_requests():
    """Render pending requests view"""
    st.subheader("Pending Requests")
    
    if not st.session_state.authenticated:
        st.warning("Authentication required to view pending requests")
        return
    
    if st.session_state.pending_requests:
        for idx, request in enumerate(st.session_state.pending_requests):
            with st.container():
                col1, col2, col3, col4 = st.columns([3, 1, 1, 1])
                
                with col1:
                    st.write(f"**{request['item']}** - {request['requestor']}")
                    st.write(f"Priority: {request['priority']} | Quantity: {request['quantity']}")
                    if request.get('justification'):
                        st.write(f"Justification: {request['justification']}")
                
                with col2:
                    st.write(f"Category: {request['category']}")
                    st.write(f"Date: {request['date_requested']}")
                
                with col3:
                    if st.button("Approve", key=f"approve_{idx}"):
                        # Move to inventory with complete status
                        new_id = max([item["id"] for item in st.session_state.inventory_data], default=0) + 1
                        inventory_item = {
                            "id": new_id,
                            "item": request['item'],
                            "category": request['category'],
                            "status": "complete",
                            "requestor": request['requestor'],
                            "date_requested": request['date_requested']
                        }
                        st.session_state.inventory_data.append(inventory_item)
                        st.session_state.pending_requests.pop(idx)
                        st.success(f"Approved {request['item']}")
                        st.rerun()
                
                with col4:
                    if st.button("Deny", key=f"deny_{idx}"):
                        st.session_state.pending_requests.pop(idx)
                        st.success(f"Denied {request['item']}")
                        st.rerun()
                
                st.divider()
    else:
        st.info("No pending requests")

def render_survey_dialog():
    """Render survey form"""
    if not st.session_state.survey_enabled:
        return
        
    if st.button("📋 Please take this quick survey", type="primary"):
        with st.form("survey_form"):
            st.subheader("System Feedback Survey")
            
            user_type = st.selectbox("User Type", ["Event Senior Staff", "Event Participant", "Requestor Only"])
            would_use_again = st.radio("Would you use this system again?", ["Yes", "No", "Maybe"])
            prefer_over_excel = st.radio("Do you prefer this system over Excel spreadsheets?", ["Yes", "No", "Same"])
            feedback = st.text_area("Additional Feedback", placeholder="Any suggestions or comments...")
            
            if st.form_submit_button("Submit Survey"):
                # In production, this would save to Firebase/database
                st.success("Thank you for your feedback!")

def main():
    """Main application function"""
    try:
        render_header()
        
        # Survey button in header area if enabled
        if st.session_state.survey_enabled:
            render_survey_dialog()
        
        # Authentication check for protected tabs
        protected_tabs = ["Inventory Tracking", "Admin Panel", "Pending Requests"]
        
        # Main navigation tabs
        tabs = st.tabs(["➕ Request Items", "📦 Inventory Tracking", "⚙️ Admin Panel", "⏰ Pending Requests"])
    except Exception as e:
        st.error(f"Application error: {str(e)}")
        st.stop()
    
    with tabs[0]:
        render_request_form()
    
    with tabs[1]:
        if st.session_state.password_required and not st.session_state.authenticated:
            st.warning("Authentication required for inventory access")
            password = st.text_input("Enter event password", type="password", key="inventory_auth")
            if st.button("Access Inventory"):
                if authenticate_user(password):
                    st.session_state.authenticated = True
                    st.success("Access granted")
                    st.rerun()
                else:
                    st.error("Invalid password")
        else:
            render_inventory_table()
    
    with tabs[2]:
        render_admin_panel()
    
    with tabs[3]:
        if st.session_state.password_required and not st.session_state.authenticated:
            st.warning("Authentication required for pending requests")
            password = st.text_input("Enter event password", type="password", key="pending_auth")
            if st.button("Access Pending"):
                if authenticate_user(password):
                    st.session_state.authenticated = True
                    st.success("Access granted")
                    st.rerun()
                else:
                    st.error("Invalid password")
        else:
            render_pending_requests()
    
    # Footer
    st.markdown("---")
    st.markdown("""
    <div style="text-align: center; color: #6b7280; font-size: 0.8rem; padding: 1rem;">
        <strong>Tech Support & Owner:</strong> C/CMSgt Kendrick Uhles • (661) 381-3184 • 
        <a href="mailto:Kendrick.Uhles@CawgCap.org">Kendrick.Uhles@CawgCap.org</a><br>
        <em>If you want to use this system for your own events, contact me at my email</em>
    </div>
    """, unsafe_allow_html=True)

if __name__ == "__main__":
    main()