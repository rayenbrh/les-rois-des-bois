import { Link } from 'react-router-dom';

export default function PublicFooter() {
  return (
    <footer className="bg-charcoal dark:bg-black border-t border-gray-800 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-gold">ملوك الخشب</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              نحن متخصصون في صناعة الأثاث الخشبي الفاخر بجودة عالمية وتصاميم عصرية
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold mb-4">روابط سريعة</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/products" className="text-gray-400 hover:text-gold transition-colors">
                  المنتجات
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-gold transition-colors">
                  من نحن
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-gold transition-colors">
                  اتصل بنا
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-sm font-semibold mb-4">خدماتنا</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/products?isSpecial=true" className="text-gray-400 hover:text-gold transition-colors">
                  التصميم المخصص
                </Link>
              </li>
              <li>
                <span className="text-gray-400">التوصيل المجاني</span>
              </li>
              <li>
                <span className="text-gray-400">ضمان الجودة</span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold mb-4">تواصل معنا</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>📞 +216 71 123 456</li>
              <li>📧 contact@lesroisdebois.com</li>
              <li>📍 تونس، تونس</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>© 2025 ملوك الخشب | Les Rois des Bois. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  );
}
