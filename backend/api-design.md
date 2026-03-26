# Authentication
POST   /api/auth/login           # User login
POST   /api/auth/register        # Patient registration
POST   /api/auth/refresh         # Refresh token
POST   /api/auth/logout          # User logout
POST   /api/auth/forgot-password # Password reset

# Patient Management
GET    /api/patients             # List patients (staff/admin)
GET    /api/patients/{id}        # Get patient details
PUT    /api/patients/{id}        # Update patient profile
GET    /api/patients/{id}/records # Get patient medical records

# Doctor Management
GET    /api/doctors              # List all doctors
GET    /api/doctors/{id}         # Get doctor details
GET    /api/doctors/{id}/availability # Get doctor availability
PUT    /api/doctors/{id}/availability # Update availability

# Appointment Management
GET    /api/appointments         # List appointments (filtered)
GET    /api/appointments/{id}    # Get appointment details
POST   /api/appointments         # Create new appointment
PUT    /api/appointments/{id}    # Update appointment
DELETE /api/appointments/{id}    # Cancel appointment
GET    /api/appointments/available-slots # Check available slots

# Medical Records
GET    /api/medical-records      # List patient records
GET    /api/medical-records/{id} # Get record details
POST   /api/medical-records      # Create medical record
PUT    /api/medical-records/{id} # Update medical record
POST   /api/medical-records/upload # Upload document

# Billing
GET    /api/bills                # List bills
GET    /api/bills/{id}           # Get bill details
POST   /api/bills/{id}/pay       # Process payment
GET    /api/bills/insurance-claims # Insurance claims

# Reports & Analytics
GET    /api/reports/appointments # Appointment reports
GET    /api/reports/no-show      # No-show statistics
GET    /api/reports/revenue      # Revenue reports
GET    /api/reports/patient-demographics # Patient demographics
GET    /api/dashboard/metrics    # Dashboard metrics
GET    /api/dashboard/kpi        # Key performance indicators

# Notifications
GET    /api/notifications        # User notifications
PUT    /api/notifications/{id}/read # Mark notification read
POST   /api/notifications/send   # Send manual notification (admin)