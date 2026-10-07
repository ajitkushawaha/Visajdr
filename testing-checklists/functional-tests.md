# Functional Testing Checklist

## User Features

### Authentication

- [ ] User can register with email and password
- [ ] User can login with credentials
- [ ] User can login with Google OAuth
- [ ] User receives verification email
- [ ] User can request password reset
- [ ] User can reset password with valid token
- [ ] Invalid login shows appropriate error
- [ ] User session persists across page refreshes

### Visa Application Flow

- [ ] User can search for countries
- [ ] Search suggestions appear correctly
- [ ] User can select a country
- [ ] Visa types display for selected country
- [ ] User can select visa type and purpose
- [ ] Application form loads correctly
- [ ] All form fields are editable
- [ ] Form validation works (required fields)
- [ ] User can upload passport document
- [ ] User can upload photo
- [ ] Upload progress shows correctly
- [ ] User can review application details
- [ ] User can edit application before submission
- [ ] User can proceed to payment
- [ ] Payment gateway loads correctly
- [ ] User receives tracking ID after payment
- [ ] Confirmation email is sent

### Application Tracking

- [ ] User can enter tracking ID
- [ ] Application status displays correctly
- [ ] Status timeline shows all stages
- [ ] Document status is visible
- [ ] User can download receipt/invoice
- [ ] Invalid tracking ID shows error

### User Dashboard

- [ ] Dashboard displays all applications
- [ ] Application cards show correct status
- [ ] User can filter applications by status
- [ ] User can search applications
- [ ] User can view application details
- [ ] User can access tracking from dashboard
- [ ] Profile information displays correctly
- [ ] User can edit profile

### Travel Insurance

- [ ] User can select destination country
- [ ] User can select travel dates
- [ ] Available plans display with pricing
- [ ] User can compare plans
- [ ] User can select a plan
- [ ] Insurance application form works
- [ ] User can upload required documents
- [ ] Payment process completes
- [ ] User receives insurance confirmation

---

## Admin Features

### Dashboard

- [ ] Admin can view total applications count
- [ ] Admin can view pending applications
- [ ] Admin can view revenue statistics
- [ ] Charts and graphs display correctly
- [ ] Recent applications list shows
- [ ] Dashboard refreshes with latest data

### Application Management

- [ ] Admin can view all applications
- [ ] Admin can filter by status
- [ ] Admin can search applications
- [ ] Admin can view application details
- [ ] Admin can update application status
- [ ] Admin can add notes to applications
- [ ] Admin can assign applications to agents
- [ ] Admin can download application documents
- [ ] Status change triggers email notification

### Agent Management

- [ ] Admin can view all agents
- [ ] Admin can create new agent
- [ ] Admin can edit agent details
- [ ] Admin can update agent commission rate
- [ ] Admin can update KYC status
- [ ] Admin can activate/deactivate agents
- [ ] KYC status change sends email
- [ ] Admin can view agent performance

### Agent Notifications

- [ ] Admin can create notifications
- [ ] Admin can select notification type
- [ ] Admin can set priority level
- [ ] Email notification option works
- [ ] Notifications list displays correctly
- [ ] Admin can mark as read
- [ ] Admin can delete notifications
- [ ] Notification count updates

### Reports & Analytics

- [ ] Total agents count displays
- [ ] Total commission displays
- [ ] Success rate calculates correctly
- [ ] Commission analytics chart shows
- [ ] Payout history table displays
- [ ] Performance metrics are accurate
- [ ] Export button generates CSV
- [ ] CSV contains all data fields
- [ ] Date filters work correctly

### Content Management

- [ ] Admin can edit hero section
- [ ] Admin can upload hero images
- [ ] Image preview displays correctly
- [ ] Changes save successfully
- [ ] Changes reflect on homepage
- [ ] Admin can add floating countries
- [ ] Admin can manage testimonials
- [ ] Admin can edit FAQ section

### Blog Management

- [ ] Admin can create new blog post
- [ ] Rich text editor works
- [ ] Admin can upload images
- [ ] Admin can set featured image
- [ ] Admin can publish/draft posts
- [ ] Admin can edit existing posts
- [ ] Admin can delete posts
- [ ] Blog posts display on frontend

### Visa Management

- [ ] Admin can create new visa
- [ ] Admin can edit visa details
- [ ] Admin can set visa pricing
- [ ] Admin can add requirements
- [ ] Admin can activate/deactivate visa
- [ ] Changes reflect on frontend
- [ ] Admin can manage visa categories

### User Management

- [ ] Admin can view all users
- [ ] Admin can search users
- [ ] Admin can view user details
- [ ] Admin can activate/deactivate users
- [ ] Admin can change user roles
- [ ] Admin can reset user password

### Settings

- [ ] Admin can update company settings
- [ ] Admin can configure payment gateway
- [ ] Admin can set convenience fees
- [ ] Admin can manage suppliers
- [ ] Settings save correctly
- [ ] Changes take effect immediately

---

## Agent Features

### Dashboard

- [ ] Agent can view assigned applications
- [ ] Agent can view commission earned
- [ ] Agent can view success rate
- [ ] Dashboard shows key metrics
- [ ] Recent activity displays

### Client Management

- [ ] Agent can view all clients
- [ ] Agent can add new client
- [ ] Agent can edit client details
- [ ] Agent can view client applications
- [ ] Client search works

### Application Assistance

- [ ] Agent can create application for client
- [ ] Agent can upload documents
- [ ] Agent can track application status
- [ ] Agent can view application details
- [ ] Agent can add notes

### Commission Tracking

- [ ] Agent can view all commissions
- [ ] Commission amounts are accurate
- [ ] Agent can see payout status
- [ ] Agent can view payout history
- [ ] Commission reports are accessible

---

## Notes

- **Test Environment**: Staging/Test environment
- **Test Data**: Use test accounts and dummy data
- **Browser**: Test on Chrome, Firefox, Safari, Edge
- **Devices**: Test on desktop, tablet, mobile
- **Report Issues**: Log all bugs in issue tracker
