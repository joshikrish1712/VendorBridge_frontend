import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { DashboardLayout } from "./components/DashboardLayout";

// Pages
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Dashboard } from "./pages/Dashboard";
import { RFQList } from "./pages/RFQList";
import { RFQCreate } from "./pages/RFQCreate";
import { RFQDetails } from "./pages/RFQDetails";
import { ComparisonMatrix } from "./pages/ComparisonMatrix";
import { POList } from "./pages/POList";
import { PODetails } from "./pages/PODetails";
import { InvoiceList } from "./pages/InvoiceList";
import { InvoiceDetails } from "./pages/InvoiceDetails";
import { QuotationList } from "./pages/QuotationList";
import { VendorOnboardingList } from "./pages/VendorOnboardingList";
import { Approvals } from "./pages/Approvals";
import { Reports } from "./pages/Reports";
import { Settings } from "./pages/Settings";
import { Unauthorized } from "./pages/Unauthorized";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Secure App Shell Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard Homepage */}
            <Route index element={<Dashboard />} />

            {/* RFQs & Tenders */}
            <Route path="rfqs" element={<RFQList />} />
            <Route
              path="rfqs/create"
              element={
                <ProtectedRoute allowedRoles={["PROCUREMENT", "ADMIN"]}>
                  <RFQCreate />
                </ProtectedRoute>
              }
            />
            <Route path="rfqs/:id" element={<RFQDetails />} />
            <Route
              path="rfqs/:rfqId/compare"
              element={
                <ProtectedRoute allowedRoles={["PROCUREMENT", "ADMIN", "MANAGER"]}>
                  <ComparisonMatrix />
                </ProtectedRoute>
              }
            />

            {/* Purchase Orders */}
            <Route path="purchase-orders" element={<POList />} />
            <Route path="purchase-orders/:id" element={<PODetails />} />

            {/* Invoices */}
            <Route path="invoices" element={<InvoiceList />} />
            <Route path="invoices/:id" element={<InvoiceDetails />} />

            {/* System Approvals */}
            <Route
              path="approvals"
              element={
                <ProtectedRoute allowedRoles={["PROCUREMENT", "ADMIN", "MANAGER"]}>
                  <Approvals />
                </ProtectedRoute>
              }
            />

            {/* Reports & Sourcing Analytics */}
            <Route path="reports" element={<Reports />} />

            {/* Settings & Configuration */}
            <Route path="settings" element={<Settings />} />

            {/* Vendor Specific */}
            <Route
              path="quotations"
              element={
                <ProtectedRoute allowedRoles={["VENDOR"]}>
                  <QuotationList />
                </ProtectedRoute>
              }
            />

            {/* Admin Specific */}
            <Route
              path="vendor-onboarding"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <VendorOnboardingList />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
