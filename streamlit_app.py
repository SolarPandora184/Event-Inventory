import streamlit as st
import pandas as pd
import json
from datetime import datetime
from typing import Dict, List, Optional

# Configure Streamlit page
st.set_page_config(
    page_title="AESA Squadron 72 Inventory Management",
    page_icon="🛡️",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Exact CSS styling matching the React app
st.markdown("""
<style>
    /* Import Inter font */
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    
    /* Root variables matching the React app exactly */
    :root {
        --background: hsl(210, 15%, 6%);
        --foreground: hsl(200, 7%, 92%);
        --card: hsl(210, 15%, 9%);
        --card-foreground: hsl(200, 7%, 92%);
        --primary: hsl(203, 89%, 53%);
        --secondary: hsl(210, 15%, 13%);
        --border: hsl(210, 15%, 19%);
        --input: hsl(210, 15%, 13%);
        --aesa-blue: hsl(210, 70%, 25%);
        --aesa-accent: hsl(200, 60%, 45%);
        --text-primary: hsl(200, 7%, 92%);
        --text-secondary: hsl(210, 7%, 58%);
        --text-muted: hsl(210, 7%, 43%);
        --status-missing: hsl(356, 91%, 54%);
        --status-complete: hsl(159, 81%, 36%);
        --status-verified: hsl(217, 71%, 53%);
        --status-returned: hsl(185, 73%, 45%);
    }
    
    /* Main app styling */
    .stApp {
        background-color: hsl(210, 15%, 6%);
        color: hsl(200, 7%, 92%);
        font-family: 'Inter', system-ui, sans-serif;
    }
    
    /* Header exactly matching React */
    .main-header {
        background-color: hsl(210, 15%, 9%);
        border: 1px solid hsl(210, 15%, 19%);
        border-radius: 0.75rem;
        margin-bottom: 2rem;
    }
    
    /* Card styling exactly matching React */
    .inventory-card {
        background-color: hsl(210, 15%, 9%);
        border: 1px solid hsl(210, 15%, 19%);
        border-radius: 0.75rem;
        padding: 1.5rem;
        margin-bottom: 1.5rem;
    }
    
    /* Status badges exactly matching React */
    .status-missing {
        color: hsl(356, 91%, 54%);
        background-color: rgba(239, 68, 68, 0.1);
        border: 1px solid rgba(239, 68, 68, 0.2);
        padding: 0.25rem 0.75rem;
        border-radius: 0.375rem;
        font-size: 0.875rem;
        font-weight: 500;
        display: inline-block;
    }
    
    .status-complete {
        color: hsl(159, 81%, 36%);
        background-color: rgba(34, 197, 94, 0.1);
        border: 1px solid rgba(34, 197, 94, 0.2);
        padding: 0.25rem 0.75rem;
        border-radius: 0.375rem;
        font-size: 0.875rem;
        font-weight: 500;
        display: inline-block;
    }
    
    .status-verified {
        color: hsl(217, 71%, 53%);
        background-color: rgba(59, 130, 246, 0.1);
        border: 1px solid rgba(59, 130, 246, 0.2);
        padding: 0.25rem 0.75rem;
        border-radius: 0.375rem;
        font-size: 0.875rem;
        font-weight: 500;
        display: inline-block;
    }
    
    .status-returned {
        color: hsl(185, 73%, 45%);
        background-color: rgba(6, 182, 212, 0.1);
        border: 1px solid rgba(6, 182, 212, 0.2);
        padding: 0.25rem 0.75rem;
        border-radius: 0.375rem;
        font-size: 0.875rem;
        font-weight: 500;
        display: inline-block;
    }
    
    /* Table styling matching React */
    .stDataFrame {
        background-color: hsl(210, 15%, 9%);
        border: 1px solid hsl(210, 15%, 19%);
        border-radius: 0.75rem;
    }
    
    .stDataFrame table {
        color: hsl(200, 7%, 92%);
    }
    
    /* Button styling matching React */
    .stButton > button {
        background-color: hsl(210, 70%, 25%);
        color: white;
        border: none;
        border-radius: 0.375rem;
        font-weight: 500;
        font-family: 'Inter', system-ui, sans-serif;
    }
    
    .stButton > button:hover {
        background-color: hsl(200, 60%, 45%);
    }
    
    /* Tab styling */
    .stTabs [data-baseweb="tab-list"] {
        background-color: hsl(210, 15%, 13%);
        border-radius: 0.75rem;
        border: 1px solid hsl(210, 15%, 19%);
    }
    
    .stTabs [data-baseweb="tab"] {
        color: hsl(210, 7%, 58%);
        background-color: transparent;
    }
    
    .stTabs [aria-selected="true"] {
        background-color: hsl(210, 15%, 9%);
        color: hsl(203, 89%, 53%);
    }
    
    /* Input styling matching React */
    .stTextInput > div > div > input,
    .stNumberInput > div > div > input,
    .stSelectbox > div > div > div,
    .stTextArea > div > div > textarea {
        background-color: hsl(210, 15%, 13%);
        border: 1px solid hsl(210, 15%, 19%);
        color: hsl(200, 7%, 92%);
        border-radius: 0.375rem;
    }
    
    /* Filter button styling */
    .filter-button {
        border: 1px solid;
        padding: 0.5rem 1rem;
        border-radius: 0.375rem;
        font-size: 0.875rem;
        font-weight: 500;
        margin: 0.25rem;
        cursor: pointer;
        transition: all 0.2s;
    }
    
    .filter-missing {
        border-color: hsl(356, 91%, 54%);
        color: hsl(356, 91%, 54%);
    }
    
    .filter-missing:hover,
    .filter-missing.active {
        background-color: hsl(356, 91%, 54%);
        color: white;
    }
    
    .filter-received {
        border-color: hsl(159, 81%, 36%);
        color: hsl(159, 81%, 36%);
    }
    
    .filter-received:hover,
    .filter-received.active {
        background-color: hsl(159, 81%, 36%);
        color: white;
    }
    
    .filter-assigned {
        border-color: hsl(217, 71%, 53%);
        color: hsl(217, 71%, 53%);
    }
    
    .filter-assigned:hover,
    .filter-assigned.active {
        background-color: hsl(217, 71%, 53%);
        color: white;
    }
    
    .filter-returned {
        border-color: hsl(185, 73%, 45%);
        color: hsl(185, 73%, 45%);
    }
    
    .filter-returned:hover,
    .filter-returned.active {
        background-color: hsl(185, 73%, 45%);
        color: white;
    }
    
    /* Card title styling */
    .card-title {
        font-size: 1.5rem;
        font-weight: 700;
        color: hsl(200, 7%, 92%);
        margin-bottom: 0.5rem;
        display: flex;
        align-items: center;
    }
    
    .card-description {
        color: hsl(210, 7%, 58%);
        font-size: 0.875rem;
        margin-bottom: 1.5rem;
    }
    
    /* Footer styling */
    .footer {
        border-top: 1px solid hsl(210, 15%, 19%);
        background-color: hsl(210, 15%, 9%);
        padding: 1rem;
        margin-top: 3rem;
        text-align: center;
        color: hsl(210, 7%, 43%);
        font-size: 0.75rem;
    }
</style>
""", unsafe_allow_html=True)

# Initialize session state matching React app exactly
if "inventory_items" not in st.session_state:
    st.session_state.inventory_items = {}
if "requests" not in st.session_state:
    st.session_state.requests = {}
if "authenticated" not in st.session_state:
    st.session_state.authenticated = False
if "event_name" not in st.session_state:
    st.session_state.event_name = "AESA Squadron 72"
if "password_required" not in st.session_state:
    st.session_state.password_required = True
if "survey_enabled" not in st.session_state:
    st.session_state.survey_enabled = False
if "current_filter" not in st.session_state:
    st.session_state.current_filter = None

# Sample data matching React app structure
SAMPLE_INVENTORY = {
    "item1": {
        "itemName": "Combat Helmet",
        "requested": 5,
        "onHand": 2,
        "received": 3,
        "missing": 0,
        "custodian": "SSgt Johnson",
        "location": "Supply Room A",
        "email": "johnson@example.com",
        "phone": "555-0101",
        "expendable": False,
        "verified": False,
        "returned": False,
        "timestamp": 1735862400000
    },
    "item2": {
        "itemName": "Field Radio",
        "requested": 3,
        "onHand": 1,
        "received": 0,
        "missing": 3,
        "custodian": "A1C Smith",
        "location": "Comm Center",
        "email": "smith@example.com",
        "phone": "555-0102",
        "expendable": False,
        "verified": False,
        "returned": False,
        "timestamp": 1735862400000
    },
    "item3": {
        "itemName": "Night Vision Goggles",
        "requested": 2,
        "onHand": 2,
        "received": 2,
        "missing": 0,
        "custodian": "TSgt Davis",
        "location": "Equipment Bay",
        "email": "davis@example.com",
        "phone": "555-0103",
        "expendable": False,
        "verified": True,
        "returned": False,
        "timestamp": 1735862400000
    }
}

if not st.session_state.inventory_items:
    st.session_state.inventory_items = SAMPLE_INVENTORY

def get_item_status(item):
    """Get item status exactly like React app"""
    if item.get('returned', False):
        return 'returned'
    if item.get('verified', False):
        return 'assigned'
    if (item.get('received', 0) >= item.get('requested', 0)):
        return 'received'
    return 'missing'

def render_header():
    """Render header exactly matching React app"""
    st.markdown(f"""
    <div class="main-header">
        <div style="padding: 1rem; display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center;">
                <div style="width: 40px; height: 40px; background: hsl(210, 70%, 25%); border-radius: 0.5rem; display: flex; align-items: center; justify-content: center; margin-right: 1rem;">
                    🛡️
                </div>
                <div>
                    <h1 style="margin: 0; font-size: 1.25rem; font-weight: 700; color: hsl(200, 7%, 92%);">{st.session_state.event_name}</h1>
                    <p style="margin: 0; color: hsl(210, 7%, 58%); font-size: 0.875rem;">Inventory Management System</p>
                </div>
            </div>
            <div style="display: flex; align-items: center; gap: 1rem;">
                <div style="background: rgba(34, 197, 94, 0.2); border: 1px solid rgba(34, 197, 94, 0.3); padding: 0.5rem 1rem; border-radius: 0.375rem;">
                    <span style="color: #22c55e; font-size: 0.875rem;">● System Online</span>
                </div>
                {f'<div style="background: rgba(59, 130, 246, 0.2); border: 1px solid rgba(59, 130, 246, 0.3); padding: 0.5rem 1rem; border-radius: 0.375rem;"><span style="color: #3b82f6; font-size: 0.875rem;">🛡️ Admin Access</span></div>' if st.session_state.authenticated else ''}
            </div>
        </div>
    </div>
    """, unsafe_allow_html=True)
    
    # Survey button matching React placement
    if st.session_state.survey_enabled:
        col1, col2, col3 = st.columns([1, 2, 1])
        with col2:
            if st.button("📋 Please take this quick survey", key="survey_btn", type="primary"):
                st.session_state.show_survey = True

def render_request_form():
    """Request form exactly matching React app"""
    st.markdown('<div class="inventory-card">', unsafe_allow_html=True)
    
    st.markdown("""
    <div class="card-title">
        ➕ Request Items
    </div>
    <div class="card-description">
        Submit a new inventory request for review
    </div>
    """, unsafe_allow_html=True)
    
    with st.form("request_form", clear_on_submit=True):
        col1, col2 = st.columns(2)
        
        with col1:
            item_name = st.text_input("Item Name *", placeholder="Enter item name")
            requested = st.number_input("Quantity Requested *", min_value=1, value=1)
            custodian = st.text_input("Custodian (Who Needs It) *", placeholder="Enter custodian name")
        
        with col2:
            location = st.text_input("Location *", placeholder="Enter location")
            email = st.text_input("Email Address *", placeholder="Enter email address")
            phone = st.text_input("Phone Number", placeholder="Enter phone number")
        
        expendable = st.selectbox("Item Type", ["Non-Expendable (Returnable)", "Expendable (Consumable)"])
        
        col_btn1, col_btn2 = st.columns([1, 1])
        with col_btn1:
            clear_btn = st.form_submit_button("🗑️ Clear Form", type="secondary")
        with col_btn2:
            submit_btn = st.form_submit_button("🛡️ Submit Request", type="primary")
        
        if submit_btn:
            if item_name and requested and custodian and location and email:
                new_key = f"req_{len(st.session_state.requests) + 1}"
                st.session_state.requests[new_key] = {
                    "itemName": item_name,
                    "requested": requested,
                    "custodian": custodian,
                    "location": location,
                    "email": email,
                    "phone": phone or "",
                    "expendable": expendable == "Expendable (Consumable)",
                    "timestamp": datetime.now().timestamp() * 1000
                }
                st.success(f"✅ Your request for {item_name} has been submitted successfully.")
                st.rerun()
            else:
                st.error("❌ Please fill in all required fields (marked with *)")
    
    st.markdown('</div>', unsafe_allow_html=True)

def render_inventory_table():
    """Inventory table exactly matching React app"""
    st.markdown('<div class="inventory-card">', unsafe_allow_html=True)
    
    st.markdown("""
    <div class="card-title">
        📦 Inventory Tracking
    </div>
    <div class="card-description">
        Monitor and manage inventory status
    </div>
    """, unsafe_allow_html=True)
    
    # Filter buttons exactly like React app
    st.markdown("**Filters:**")
    col1, col2, col3, col4, col5 = st.columns(5)
    
    with col1:
        if st.button("⚠️ Missing", key="filter_missing"):
            st.session_state.current_filter = 'missing' if st.session_state.current_filter != 'missing' else None
    
    with col2:
        if st.button("✅ Received", key="filter_received"):
            st.session_state.current_filter = 'received' if st.session_state.current_filter != 'received' else None
    
    with col3:
        if st.button("🛡️ Assigned", key="filter_assigned"):
            st.session_state.current_filter = 'assigned' if st.session_state.current_filter != 'assigned' else None
    
    with col4:
        if st.button("🔄 Returned", key="filter_returned"):
            st.session_state.current_filter = 'returned' if st.session_state.current_filter != 'returned' else None
    
    with col5:
        if st.button("📊 Export", key="export_btn"):
            # Export functionality
            items_list = []
            for key, item in st.session_state.inventory_items.items():
                status = get_item_status(item)
                items_list.append({
                    "Item Name": item.get("itemName", ""),
                    "Requested": item.get("requested", 0),
                    "On Hand": item.get("onHand", 0),
                    "Received": item.get("received", 0),
                    "Missing": item.get("missing", 0),
                    "Custodian": item.get("custodian", ""),
                    "Location": item.get("location", ""),
                    "Email": item.get("email", ""),
                    "Phone": item.get("phone", ""),
                    "Expendable": "Yes" if item.get("expendable", False) else "No",
                    "Status": status.title()
                })
            
            if items_list:
                df = pd.DataFrame(items_list)
                csv = df.to_csv(index=False)
                st.download_button(
                    label="💾 Download CSV",
                    data=csv,
                    file_name=f"inventory_export_{datetime.now().strftime('%Y-%m-%d')}.csv",
                    mime="text/csv"
                )
    
    # Filter items based on current filter
    filtered_items = {}
    for key, item in st.session_state.inventory_items.items():
        if st.session_state.current_filter is None:
            filtered_items[key] = item
        elif get_item_status(item) == st.session_state.current_filter:
            filtered_items[key] = item
    
    if filtered_items:
        # Create table data exactly matching React app
        table_data = []
        for key, item in filtered_items.items():
            status = get_item_status(item)
            table_data.append({
                "Item Name": item.get("itemName", ""),
                "Requested": item.get("requested", 0),
                "On Hand": item.get("onHand", 0),
                "Received": item.get("received", 0),
                "Missing": item.get("missing", 0),
                "Custodian": item.get("custodian", ""),
                "Location": item.get("location", ""),
                "Contact": f"{item.get('email', '')}\n{item.get('phone', '')}",
                "Type": "Expendable" if item.get("expendable", False) else "Non-Expendable",
                "Status": status.title(),
                "Actions": "Actions"
            })
        
        df = pd.DataFrame(table_data)
        st.dataframe(df, use_container_width=True, hide_index=True)
        
        # Action buttons for each item (admin only)
        if st.session_state.authenticated:
            st.markdown("---")
            st.markdown("**Admin Actions:**")
            for key, item in filtered_items.items():
                with st.expander(f"Actions for {item.get('itemName', 'Unknown Item')}"):
                    status = get_item_status(item)
                    
                    col1, col2, col3 = st.columns(3)
                    
                    if status == 'missing':
                        with col1:
                            received_qty = st.number_input(f"Received Qty", min_value=0, key=f"recv_{key}")
                        with col2:
                            if st.button(f"➕ Add Received", key=f"add_recv_{key}"):
                                if received_qty >= 0:
                                    st.session_state.inventory_items[key]['received'] = received_qty
                                    st.success(f"✅ Updated received quantity to {received_qty}")
                                    st.rerun()
                    
                    elif status == 'received':
                        with col1:
                            if st.button(f"🛡️ Assign", key=f"assign_{key}"):
                                st.session_state.inventory_items[key]['verified'] = True
                                st.success(f"✅ Item has been assigned successfully")
                                st.rerun()
                    
                    elif status == 'assigned':
                        with col1:
                            if st.button(f"🔄 Mark Returned", key=f"return_{key}"):
                                st.session_state.inventory_items[key]['returned'] = True
                                st.success(f"✅ Item has been marked as returned")
                                st.rerun()
                        with col2:
                            returned_amt = st.number_input(f"Amount Returned", min_value=0, max_value=item.get('requested', 0), key=f"ret_amt_{key}")
                        with col3:
                            if st.button(f"➖ Record Missing", key=f"missing_{key}"):
                                missing = item.get('requested', 0) - returned_amt
                                st.session_state.inventory_items[key]['missing'] = missing
                                st.session_state.inventory_items[key]['received'] = returned_amt
                                st.success(f"✅ Missing quantity set to {missing}")
                                st.rerun()
                    
                    # Edit and Delete buttons for all items
                    with col3:
                        if st.button(f"✏️ Edit", key=f"edit_{key}"):
                            st.info("Edit functionality would open a dialog here")
                        if st.button(f"🗑️ Delete", key=f"delete_{key}"):
                            if st.button(f"⚠️ Confirm Delete", key=f"confirm_del_{key}"):
                                del st.session_state.inventory_items[key]
                                st.success(f"✅ Item deleted successfully")
                                st.rerun()
    else:
        st.info("No inventory items found.")
    
    st.markdown('</div>', unsafe_allow_html=True)

def render_admin_panel():
    """Admin panel exactly matching React app"""
    if not st.session_state.authenticated:
        st.markdown('<div class="inventory-card">', unsafe_allow_html=True)
        st.warning("🔐 Admin access required")
        password = st.text_input("Enter admin password", type="password")
        if st.button("🔓 Authenticate"):
            if password == "admin":  # Simple auth for demo
                st.session_state.authenticated = True
                st.success("✅ Admin authenticated")
                st.rerun()
            else:
                st.error("❌ Invalid admin password")
        st.markdown('</div>', unsafe_allow_html=True)
        return
    
    # Event Configuration
    st.markdown('<div class="inventory-card">', unsafe_allow_html=True)
    st.markdown("""
    <div class="card-title">
        📅 Event Configuration
    </div>
    <div class="card-description">
        Set the current event name for the inventory system
    </div>
    """, unsafe_allow_html=True)
    
    col1, col2 = st.columns([3, 1])
    with col1:
        new_event_name = st.text_input(
            f"Current Event: **{st.session_state.event_name}**",
            placeholder="Enter new event name"
        )
    with col2:
        if st.button("💾 Save Event Name"):
            if new_event_name.strip():
                st.session_state.event_name = new_event_name.strip()
                st.success(f"✅ Event name updated to '{new_event_name.strip()}'")
                st.rerun()
    st.markdown('</div>', unsafe_allow_html=True)
    
    # Survey Management
    st.markdown('<div class="inventory-card">', unsafe_allow_html=True)
    st.markdown("""
    <div class="card-title">
        📋 Survey Management
    </div>
    <div class="card-description">
        Control survey display and export response data
    </div>
    """, unsafe_allow_html=True)
    
    col1, col2 = st.columns([3, 1])
    with col1:
        survey_enabled = st.checkbox(
            "Enable Survey Button",
            value=st.session_state.survey_enabled,
            help="When enabled, a survey button will appear in the header for all users"
        )
        if survey_enabled != st.session_state.survey_enabled:
            st.session_state.survey_enabled = survey_enabled
            st.success("✅ Survey setting updated")
            st.rerun()
    
    with col2:
        if st.button("📊 Export Survey Data"):
            st.info("Export functionality would download CSV here")
    st.markdown('</div>', unsafe_allow_html=True)
    
    # Add New Item
    st.markdown('<div class="inventory-card">', unsafe_allow_html=True)
    st.markdown("""
    <div class="card-title">
        ➕ Add Inventory Item
    </div>
    <div class="card-description">
        Add a new item to the inventory system
    </div>
    """, unsafe_allow_html=True)
    
    with st.form("add_item_form"):
        col1, col2 = st.columns(2)
        
        with col1:
            item_name = st.text_input("Item Name *")
            requested = st.number_input("Requested Quantity *", min_value=1, value=1)
            on_hand = st.number_input("On Hand Quantity", min_value=0, value=0)
            custodian = st.text_input("Custodian")
        
        with col2:
            location = st.text_input("Location")
            email = st.text_input("Email Address")
            phone = st.text_input("Phone Number")
            expendable = st.selectbox("Item Type", ["Non-Expendable", "Expendable"])
        
        if st.form_submit_button("🛡️ Add Item", type="primary"):
            if item_name and requested:
                new_key = f"admin_item_{len(st.session_state.inventory_items) + 1}"
                st.session_state.inventory_items[new_key] = {
                    "itemName": item_name,
                    "requested": requested,
                    "onHand": on_hand,
                    "received": 0,
                    "missing": 0,
                    "custodian": custodian or "",
                    "location": location or "",
                    "email": email or "",
                    "phone": phone or "",
                    "expendable": expendable == "Expendable",
                    "verified": False,
                    "returned": False,
                    "timestamp": datetime.now().timestamp() * 1000
                }
                st.success(f"✅ {item_name} has been added to inventory successfully")
                st.rerun()
            else:
                st.error("❌ Please fill in all required fields")
    
    st.markdown('</div>', unsafe_allow_html=True)
    
    # Reset Data
    st.markdown('<div class="inventory-card">', unsafe_allow_html=True)
    st.markdown("**⚠️ Danger Zone**")
    
    if st.button("🗑️ Reset All Data", type="secondary"):
        master_password = st.text_input("Enter master password to reset:", type="password", key="master_pwd")
        if st.button("⚠️ Confirm Reset", type="secondary"):
            if master_password == "Ku2023!@":
                st.session_state.inventory_items = {}
                st.session_state.requests = {}
                st.success("✅ All data has been reset")
                st.rerun()
            else:
                st.error("❌ Incorrect master password")
    
    st.markdown('</div>', unsafe_allow_html=True)

def render_pending_requests():
    """Pending requests exactly matching React app"""
    if not st.session_state.authenticated:
        st.warning("🔐 Authentication required to view pending requests")
        return
    
    st.markdown('<div class="inventory-card">', unsafe_allow_html=True)
    st.markdown("""
    <div class="card-title">
        ⏰ Pending Requests
    </div>
    <div class="card-description">
        Review and approve submitted inventory requests
    </div>
    """, unsafe_allow_html=True)
    
    if st.session_state.requests:
        st.markdown(f"**{len(st.session_state.requests)} pending request(s)**")
        
        for req_key, request in st.session_state.requests.items():
            with st.container():
                st.markdown("---")
                col1, col2, col3 = st.columns([3, 2, 2])
                
                with col1:
                    st.markdown(f"**{request.get('itemName', 'Unknown')}** - {request.get('custodian', 'Unknown')}")
                    st.markdown(f"Quantity: **{request.get('requested', 0)}**")
                    st.markdown(f"Location: {request.get('location', 'Not specified')}")
                
                with col2:
                    st.markdown(f"**Contact:**")
                    st.markdown(f"📧 {request.get('email', 'No email')}")
                    if request.get('phone'):
                        st.markdown(f"📞 {request.get('phone')}")
                    st.markdown(f"Type: {'Expendable' if request.get('expendable', False) else 'Non-Expendable'}")
                
                with col3:
                    col_approve, col_deny = st.columns(2)
                    with col_approve:
                        if st.button("✅ Approve", key=f"approve_{req_key}"):
                            # Move to inventory
                            new_key = f"item_{len(st.session_state.inventory_items) + 1}"
                            st.session_state.inventory_items[new_key] = {
                                "itemName": request.get('itemName', ''),
                                "requested": request.get('requested', 0),
                                "onHand": 0,
                                "received": request.get('requested', 0),  # Mark as received
                                "missing": 0,
                                "custodian": request.get('custodian', ''),
                                "location": request.get('location', ''),
                                "email": request.get('email', ''),
                                "phone": request.get('phone', ''),
                                "expendable": request.get('expendable', False),
                                "verified": False,
                                "returned": False,
                                "timestamp": datetime.now().timestamp() * 1000
                            }
                            del st.session_state.requests[req_key]
                            st.success(f"✅ Approved {request.get('itemName')} - Added to inventory")
                            st.rerun()
                    
                    with col_deny:
                        if st.button("❌ Deny", key=f"deny_{req_key}"):
                            del st.session_state.requests[req_key]
                            st.success(f"❌ Denied {request.get('itemName')}")
                            st.rerun()
    else:
        st.info("📭 No pending requests")
    
    st.markdown('</div>', unsafe_allow_html=True)

def main():
    """Main application exactly matching React app structure"""
    render_header()
    
    # Main tabs exactly matching React app
    tab1, tab2, tab3, tab4 = st.tabs([
        "➕ Request Items",
        "📦 Inventory Tracking", 
        "⚙️ Admin Panel",
        "⏰ Pending Requests"
    ])
    
    with tab1:
        render_request_form()
    
    with tab2:
        if st.session_state.password_required and not st.session_state.authenticated:
            st.warning("🔐 Authentication required for inventory access")
            password = st.text_input("Enter event password", type="password", key="inventory_auth")
            if st.button("🔓 Access Inventory"):
                if password == "squadron72":  # Default event password
                    st.session_state.authenticated = True
                    st.success("✅ Access granted")
                    st.rerun()
                else:
                    st.error("❌ Invalid password")
        else:
            render_inventory_table()
    
    with tab3:
        render_admin_panel()
    
    with tab4:
        if st.session_state.password_required and not st.session_state.authenticated:
            st.warning("🔐 Authentication required for pending requests")
            password = st.text_input("Enter event password", type="password", key="pending_auth")
            if st.button("🔓 Access Pending"):
                if password == "squadron72":
                    st.session_state.authenticated = True
                    st.success("✅ Access granted")
                    st.rerun()
                else:
                    st.error("❌ Invalid password")
        else:
            render_pending_requests()
    
    # Footer exactly matching React app
    st.markdown("""
    <div class="footer">
        <div style="opacity: 0.7;">
            <strong>Tech Support & Owner:</strong> C/CMSgt Kendrick Uhles • (661) 381-3184 • 
            <a href="mailto:Kendrick.Uhles@CawgCap.org" style="color: hsl(203, 89%, 53%); text-decoration: none;">Kendrick.Uhles@CawgCap.org</a>
        </div>
        <div style="margin-top: 0.5rem; opacity: 0.6;">
            <em>If you want to use this system for your own events, contact me at my email</em>
        </div>
    </div>
    """, unsafe_allow_html=True)

if __name__ == "__main__":
    main()