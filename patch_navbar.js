const fs = require('fs');

let content = fs.readFileSync('bupzo-frontend/components/Navbar.tsx', 'utf8');

// Replace the language select with Google Translate logic
const oldSelect = `<select className="bg-transparent border-none outline-none text-gray-300 cursor-pointer">
            <option className="text-black">English</option>
            <option className="text-black">Tamil</option>
          </select>`;

const newSelect = `<select 
            className="bg-transparent border-none outline-none text-gray-300 cursor-pointer"
            onChange={(e) => {
              const lang = e.target.value;
              let gSelect = document.querySelector('.goog-te-combo');
              if (gSelect) {
                gSelect.value = lang;
                gSelect.dispatchEvent(new Event('change'));
              }
            }}
          >
            <option className="text-black" value="en">English</option>
            <option className="text-black" value="ta">Tamil</option>
          </select>
          <div id="google_translate_element" style={{ display: 'none' }}></div>`;

content = content.replace(oldSelect, newSelect);

// Inject useEffect for Google Translate script
if (!content.includes('useEffect(() => {')) {
    content = content.replace(`export default function Navbar({ onTabChange, activeTab, onAuthClick, onCartClick }: NavbarProps) {`, 
`import { useEffect } from 'react';\n\nexport default function Navbar({ onTabChange, activeTab, onAuthClick, onCartClick }: NavbarProps) {`);
}

const useEffectHook = `  const { user, clearUser } = useAuthStore();

  useEffect(() => {
    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
      
      window.googleTranslateElementInit = () => {
        new window.google.translate.TranslateElement({ pageLanguage: 'en', includedLanguages: 'en,ta', autoDisplay: false }, 'google_translate_element');
      };
    }
  }, []);`;

content = content.replace(`  const { user, clearUser } = useAuthStore();`, useEffectHook);

fs.writeFileSync('bupzo-frontend/components/Navbar.tsx', content);
console.log("Navbar.tsx patched for Google Translate!");
