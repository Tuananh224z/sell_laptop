
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { RequireAuth, RequireAdmin, GuestOnly } from './components/guards/RouteGuards';

import MainLayout from './components/layout/MainLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Products from './pages/Products';
import Register from './pages/Register';
import VerifyCode from './pages/VerifyCode';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import CheckoutSuccess from './pages/CheckoutSuccess';
import CheckoutFailed from './pages/CheckoutFailed';
import PaymentReturn from './pages/PaymentReturn';
import ProfileLayout from './pages/profile/ProfileLayout';
import ProfileInfo from './pages/profile/ProfileInfo';
import ProfileOrders from './pages/profile/ProfileOrders';
import ProfileFavorites from './pages/profile/ProfileFavorites';
import ProfileAddresses from './pages/profile/ProfileAddresses';
import ProfileChangePassword from './pages/profile/ProfileChangePassword';
import ProfileLoyalty from './pages/profile/ProfileLoyalty';
import ProfileSupport from './pages/profile/ProfileSupport';
import ProfileNotifications from './pages/profile/ProfileNotifications';
import ProductDetail from './pages/ProductDetail';
import BuyingGuide from './pages/info/BuyingGuide';
import WarrantyPolicy from './pages/info/WarrantyPolicy';
import ReturnPolicy from './pages/info/ReturnPolicy';
import PaymentMethods from './pages/info/PaymentMethods';
import DeliveryInstallation from './pages/info/DeliveryInstallation';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminCategories from './pages/admin/AdminCategories';
import AdminBrands from './pages/admin/AdminBrands';
import AdminOrders from './pages/admin/AdminOrders';
import AdminReviews from './pages/admin/AdminReviews';
import AdminUsers from './pages/admin/AdminUsers';
import AdminChat from './pages/admin/AdminChat';
import AdminProductEdit from './pages/admin/AdminProductEdit';
import AdminPromotions from './pages/admin/AdminPromotions';
import AdminMembership from './pages/admin/AdminMembership';
import AdminPOS from './pages/admin/AdminPOS';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminSupport from './pages/admin/AdminSupport';
import AdminSettings from './pages/admin/AdminSettings';

function App() {
  return (
    <BrowserRouter>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <Routes>
        <Route path="/" element={<MainLayout />}>
          {/* Public routes */}
          <Route index element={<Home />} />
          <Route path="products" element={<Products />} />
          <Route path="product/:id" element={<ProductDetail />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="checkout/success" element={<CheckoutSuccess />} />
          <Route path="checkout/failed" element={<CheckoutFailed />} />
          <Route path="payment/return" element={<PaymentReturn />} />

          {/* Info pages */}
          <Route path="buying-guide" element={<BuyingGuide />} />
          <Route path="warranty-policy" element={<WarrantyPolicy />} />
          <Route path="return-policy" element={<ReturnPolicy />} />
          <Route path="payment-methods" element={<PaymentMethods />} />
          <Route path="delivery-installation" element={<DeliveryInstallation />} />

          {/* Guest only: đã đăng nhập → redirect về / */}
          <Route element={<GuestOnly />}>
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
          </Route>

          {/* Requires login */}
          <Route element={<RequireAuth />}>
            <Route path="verify" element={<VerifyCode />} />
            <Route path="profile" element={<ProfileLayout />}>
              <Route index element={<ProfileInfo />} />
              <Route path="orders" element={<ProfileOrders />} />
              <Route path="favorites" element={<ProfileFavorites />} />
              <Route path="addresses" element={<ProfileAddresses />} />
              <Route path="change-password" element={<ProfileChangePassword />} />
              <Route path="loyalty" element={<ProfileLoyalty />} />
              <Route path="notifications" element={<ProfileNotifications />} />
              <Route path="support" element={<ProfileSupport />} />
            </Route>
          </Route>
        </Route>

        {/* Admin routes: phải là admin */}
        <Route element={<RequireAdmin />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="products/new" element={<AdminProductEdit />} />
            <Route path="products/:id/edit" element={<AdminProductEdit />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="brands" element={<AdminBrands />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="chat" element={<AdminChat />} />
            <Route path="promotions" element={<AdminPromotions />} />
            <Route path="membership" element={<AdminMembership />} />
            <Route path="pos" element={<AdminPOS />} />
            <Route path="notifications" element={<AdminNotifications />} />
            <Route path="support" element={<AdminSupport />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
