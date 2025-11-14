export default function Footer() {
  return (
    <footer className="bg-black text-white py-12 border-t border-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-10 mb-10 text-center">
          <div>
            <h4 className="font-bold mb-5 text-sm">Shop</h4>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-white transition">iPhone</a></li>
              <li><a href="#" className="hover:text-white transition">Samsung</a></li>
              <li><a href="#" className="hover:text-white transition">Huawei</a></li>
              <li><a href="#" className="hover:text-white transition">Gaming</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-5 text-sm">Support</h4>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-white transition">Contact</a></li>
              <li><a href="#" className="hover:text-white transition">Shipping</a></li>
              <li><a href="#" className="hover:text-white transition">Returns</a></li>
              <li><a href="#" className="hover:text-white transition">Warranty</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-5 text-sm">Company</h4>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-white transition">About</a></li>
              <li><a href="#" className="hover:text-white transition">Blog</a></li>
              <li><a href="#" className="hover:text-white transition">Careers</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-5 text-sm">Follow</h4>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-white transition">Instagram</a></li>
              <li><a href="#" className="hover:text-white transition">Facebook</a></li>
              <li><a href="#" className="hover:text-white transition">Twitter</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-900 pt-8 text-center">
          <p className="text-gray-400 text-sm">© 2025 VeritaShop. Premium Smartphones Worldwide.</p>
        </div>
      </div>
    </footer>
  );
}
