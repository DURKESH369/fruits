
import React, { useState, useEffect, useRef } from 'react';
import { View, Fruit, ChatMessage, CartItem } from './types';
import { INITIAL_FRUITS } from './constants';
import { identifyFruit, getFruitAssistantResponse } from './services/geminiService';
import NutritionChart from './components/NutritionChart';

// --- Sub-components ---

const Header: React.FC<{ 
  setView: (v: View) => void; 
  currentView: View; 
  cartCount: number;
  toggleCart: () => void;
  isAdminAuthenticated: boolean;
  onLogout: () => void;
}> = ({ setView, currentView, cartCount, toggleCart, isAdminAuthenticated, onLogout }) => (
  <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between">
    <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('home')}>
      <div className="bg-green-500 p-2 rounded-xl">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      </div>
      <h1 className="text-xl font-bold text-gray-800 tracking-tight">FruityVision</h1>
    </div>
    <nav className="hidden md:flex gap-6 items-center">
      {(['home', 'market', 'assistant', 'favorites', 'admin'] as View[]).map((v) => (
        <button
          key={v}
          onClick={() => setView(v)}
          className={`capitalize font-medium transition-colors ${currentView === v ? 'text-green-600' : 'text-gray-500 hover:text-green-500'}`}
        >
          {v === 'market' ? 'Marketplace' : v === 'admin' ? 'Owner' : v}
        </button>
      ))}
      <div className="h-6 w-px bg-gray-200 mx-2"></div>
      
      {isAdminAuthenticated && (
        <button 
          onClick={onLogout}
          className="text-xs font-bold text-red-500 hover:text-red-700 uppercase tracking-widest border border-red-100 px-3 py-1 rounded-lg"
        >
          Logout
        </button>
      )}

      <button 
        onClick={toggleCart}
        className="relative p-2 text-gray-500 hover:text-green-600 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        {cartCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-white">
            {cartCount}
          </span>
        )}
      </button>
    </nav>
  </header>
);

const MarketCard: React.FC<{ 
  fruit: Fruit; 
  onAddToCart: (f: Fruit) => void;
  onClick: () => void;
}> = ({ fruit, onAddToCart, onClick }) => (
  <div className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col">
    <div className="relative h-48 overflow-hidden cursor-pointer" onClick={onClick}>
      <img src={fruit.image} alt={fruit.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-green-700 px-3 py-1 rounded-full text-sm font-bold shadow-sm">
        ₹{fruit.price?.toFixed(2)}/kg
      </div>
    </div>
    <div className="p-5 flex-1 flex flex-col">
      <h3 className="text-xl font-bold text-gray-900 mb-1">{fruit.name}</h3>
      <p className="text-gray-500 text-sm mb-4 line-clamp-2">{fruit.description}</p>
      <div className="mt-auto flex items-center justify-between">
        <span className="text-xs text-gray-400">Seller: {fruit.sellerName || 'Fresh Farm'}</span>
        <button 
          onClick={(e) => { e.stopPropagation(); onAddToCart(fruit); }}
          className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-green-700 transition-colors shadow-sm active:scale-95"
        >
          Add to Cart
        </button>
      </div>
    </div>
  </div>
);

const CartDrawer: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  items: CartItem[]; 
  onUpdateQty: (id: string, delta: number) => void; 
  onRemove: (id: string) => void; 
}> = ({ isOpen, onClose, items, onUpdateQty, onRemove }) => {
  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={onClose} 
      />
      <div className={`fixed right-0 top-0 h-full w-full max-w-md bg-white z-[101] shadow-2xl transition-transform duration-500 ease-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Your Basket</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
               <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                 </svg>
               </div>
               <p className="text-gray-500 font-medium">Your basket is empty.</p>
            </div>
          ) : (
            items.map(item => (
              <div key={item.fruitId} className="flex gap-4 group">
                <img src={item.image} className="w-20 h-20 rounded-2xl object-cover" />
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <h4 className="font-bold text-gray-900">{item.name}</h4>
                    <span className="font-bold text-green-600">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                  <p className="text-sm text-gray-400 mb-3">₹{item.price.toFixed(2)} / kg</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center bg-gray-100 rounded-lg p-1">
                      <button onClick={() => onUpdateQty(item.fruitId, -1)} className="p-1 hover:bg-white rounded shadow-sm transition-colors">-</button>
                      <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                      <button onClick={() => onUpdateQty(item.fruitId, 1)} className="p-1 hover:bg-white rounded shadow-sm transition-colors">+</button>
                    </div>
                    <button onClick={() => onRemove(item.fruitId)} className="text-red-400 hover:text-red-600 text-xs font-bold uppercase tracking-wider">Remove</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <span className="text-gray-500 font-medium">Total Balance</span>
            <span className="text-3xl font-extrabold text-gray-900">₹{total.toFixed(2)}</span>
          </div>
          <button 
            disabled={items.length === 0}
            className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold hover:bg-green-700 transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
          >
            Go to Checkout
          </button>
        </div>
      </div>
    </>
  );
};

// --- Main App ---

const App: React.FC = () => {
  const [view, setView] = useState<View>('home');
  const [fruits, setFruits] = useState<Fruit[]>(INITIAL_FRUITS.map(f => ({ ...f, price: 150.00, isForSale: true, sellerName: 'Original Farm' })));
  const [selectedFruit, setSelectedFruit] = useState<Fruit | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSelling, setIsSelling] = useState(false);

  // Admin Security
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  // New product state for manual entry
  const [newFruitName, setNewFruitName] = useState('');
  const [newFruitPrice, setNewFruitPrice] = useState('');
  const [newFruitDesc, setNewFruitDesc] = useState('');
  const [newFruitImg, setNewFruitImg] = useState<string | null>(null);
  const [isAdminIdentifying, setIsAdminIdentifying] = useState(false);
  const [currentNutrients, setCurrentNutrients] = useState(INITIAL_FRUITS[0].nutrients);

  // Persistence
  useEffect(() => {
    const savedFavs = localStorage.getItem('fruit_favorites');
    if (savedFavs) setFavorites(JSON.parse(savedFavs));
    const savedCart = localStorage.getItem('fruit_cart');
    if (savedCart) setCart(JSON.parse(savedCart));
    const savedFruits = localStorage.getItem('fruit_inventory');
    if (savedFruits) setFruits(JSON.parse(savedFruits));
    const savedAuth = localStorage.getItem('admin_auth');
    if (savedAuth === 'true') setIsAdminAuthenticated(true);
  }, []);

  useEffect(() => {
    localStorage.setItem('fruit_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('fruit_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('fruit_inventory', JSON.stringify(fruits));
  }, [fruits]);

  useEffect(() => {
    localStorage.setItem('admin_auth', isAdminAuthenticated.toString());
  }, [isAdminAuthenticated]);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPasswordInput === 'owner123') {
      setIsAdminAuthenticated(true);
      setPasswordError(false);
      setAdminPasswordInput('');
    } else {
      setPasswordError(true);
      setTimeout(() => setPasswordError(false), 2000);
    }
  };

  const handleLogout = () => {
    setIsAdminAuthenticated(false);
    setView('home');
  };

  const addToCart = (fruit: Fruit) => {
    setCart(prev => {
      const existing = prev.find(item => item.fruitId === fruit.id);
      if (existing) {
        return prev.map(item => item.fruitId === fruit.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { 
        fruitId: fruit.id, 
        name: fruit.name, 
        price: fruit.price || 0, 
        quantity: 1, 
        image: fruit.image 
      }];
    });
    setIsCartOpen(true);
  };

  const updateCartQty = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.fruitId === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.fruitId !== id));
  };

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFruitName || !newFruitPrice || !newFruitImg) {
      alert("Please fill in Name, Price, and upload an Image.");
      return;
    }

    const newFruit: Fruit = {
      id: Date.now().toString(),
      name: newFruitName,
      scientificName: 'Organic Selection',
      description: newFruitDesc || 'Freshly added to inventory.',
      origin: 'Owner Store',
      season: 'Available Now',
      benefits: ['High Quality', 'Freshly Stocked'],
      nutrients: currentNutrients,
      color: 'bg-green-500',
      image: newFruitImg,
      price: parseFloat(newFruitPrice),
      isForSale: true,
      sellerName: 'Owner'
    };

    setFruits(prev => [newFruit, ...prev]);
    setNewFruitName('');
    setNewFruitPrice('');
    setNewFruitDesc('');
    setNewFruitImg(null);
    alert("Fruit added successfully!");
  };

  const handleAdminFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result as string;
        setNewFruitImg(base64Data);
        
        // Auto-identify with AI
        setIsAdminIdentifying(true);
        try {
          const rawBase64 = base64Data.split(',')[1];
          const result = await identifyFruit(rawBase64);
          if (result) {
            setNewFruitName(result.name || '');
            setNewFruitDesc(result.description || '');
            setNewFruitPrice('120.00'); // Suggest a price
            if (result.nutrients) setCurrentNutrients(result.nutrients as any);
          }
        } catch (error) {
          console.error("AI Identification failed", error);
        } finally {
          setIsAdminIdentifying(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFruitFromStore = (id: string) => {
    if (confirm("Are you sure you want to remove this fruit from the inventory?")) {
      setFruits(prev => prev.filter(f => f.id !== id));
    }
  };

  const handleSellIdentify = async (file: File) => {
    setIsIdentifying(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];
      const result = await identifyFruit(base64);
      if (result && result.name) {
        const newFruit: Fruit = {
          id: Date.now().toString(),
          name: result.name || 'Unknown Fruit',
          scientificName: result.scientificName || '',
          description: result.description || 'Fresh and organic!',
          origin: result.origin || 'Local Farm',
          season: result.season || 'N/A',
          benefits: result.benefits || [],
          nutrients: result.nutrients || INITIAL_FRUITS[0].nutrients,
          color: 'bg-green-500',
          image: reader.result as string,
          price: 180.00, 
          isForSale: true,
          sellerName: 'Me'
        };
        setFruits(prev => [newFruit, ...prev]);
        setView('market');
        setIsSelling(false);
      } else {
        alert("Couldn't analyze the fruit image. Please try again.");
      }
      setIsIdentifying(false);
    };
    reader.readAsDataURL(file);
  };

  const sendMessage = async () => {
    if (!chatInput.trim()) return;
    const userMsg = { role: 'user' as const, content: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    try {
      const history = chatMessages.map(m => ({ role: m.role, parts: [{ text: m.content }] }));
      const aiResponse = await getFruitAssistantResponse(history, userMsg.content);
      if (aiResponse) {
        setChatMessages(prev => [...prev, { role: 'model', content: aiResponse }]);
      }
    } catch (e) { console.error(e); }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50">
      <Header 
        setView={setView} 
        currentView={view} 
        cartCount={cart.reduce((a, b) => a + b.quantity, 0)}
        toggleCart={() => setIsCartOpen(!isCartOpen)}
        isAdminAuthenticated={isAdminAuthenticated}
        onLogout={handleLogout}
      />

      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cart} 
        onUpdateQty={updateCartQty}
        onRemove={removeFromCart}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        {view === 'home' && (
          <div className="animate-in fade-in duration-500 space-y-12">
            <section className="bg-gradient-to-br from-green-600 to-green-800 rounded-[3rem] p-8 md:p-20 text-white relative overflow-hidden">
               <div className="relative z-10 max-w-2xl">
                  <h2 className="text-4xl md:text-7xl font-bold mb-6 leading-[1.1]">Eat Fresh. <br/>Sell Better.</h2>
                  <p className="text-green-50 text-xl mb-10 leading-relaxed max-w-lg">
                    The world's first AI-powered fruit marketplace. Identify, analyze, and trade high-quality produce.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <button onClick={() => setView('market')} className="bg-white text-green-700 px-10 py-5 rounded-3xl font-extrabold hover:bg-green-50 transition-all shadow-xl hover:translate-y-[-2px]">
                      Start Shopping
                    </button>
                    <button onClick={() => setIsSelling(true)} className="bg-green-500/30 backdrop-blur-md text-white border border-green-400 px-10 py-5 rounded-3xl font-extrabold hover:bg-green-500/50 transition-all">
                      AI Sell Assistant
                    </button>
                  </div>
               </div>
               <div className="absolute right-[-10%] bottom-[-10%] w-[60%] opacity-10 pointer-events-none">
                  <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#FFFFFF" d="M37.5,-64.1C48.6,-57.4,57.7,-47.1,65.3,-35.6C72.9,-24,78.9,-11.2,79.5,2.1C80.2,15.4,75.4,29.1,67.3,41.2C59.2,53.3,47.8,63.9,34.4,70.1C21.1,76.3,5.8,78.2,-9.3,76.3C-24.4,74.5,-39.3,68.9,-51.1,59.3C-62.9,49.7,-71.5,36,-76.4,21C-81.2,6,-82.2,-10.3,-77.6,-25.2C-72.9,-40.1,-62.5,-53.6,-49.4,-59.8C-36.3,-66,-20.5,-64.9,-5,-57.8C10.5,-50.7,26.4,-70.7,37.5,-64.1Z" transform="translate(100 100)" />
                  </svg>
               </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-3xl font-bold text-gray-900">Featured Fruits</h3>
                <button onClick={() => setView('market')} className="text-green-600 font-bold hover:underline">View All Market Items →</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {fruits.slice(0, 3).map(f => (
                  <MarketCard key={f.id} fruit={f} onAddToCart={addToCart} onClick={() => { setSelectedFruit(f); setView('details'); }} />
                ))}
              </div>
            </section>
          </div>
        )}

        {view === 'admin' && !isAdminAuthenticated && (
          <div className="max-w-md mx-auto py-20 animate-in zoom-in-95 duration-300">
             <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-gray-100 text-center">
                <div className="w-20 h-20 bg-gray-900 text-white rounded-[2rem] flex items-center justify-center mx-auto mb-8">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                   </svg>
                </div>
                <h2 className="text-3xl font-black text-gray-900 mb-2">Owner Login</h2>
                <p className="text-gray-500 mb-8 font-medium italic text-sm">Restricted Area: Please enter password</p>
                
                <form onSubmit={handleAdminLogin} className="space-y-4">
                   <input 
                      type="password" 
                      value={adminPasswordInput}
                      onChange={(e) => setAdminPasswordInput(e.target.value)}
                      placeholder="Enter Owner Password"
                      className={`w-full bg-gray-50 border-2 ${passwordError ? 'border-red-500' : 'border-transparent'} rounded-2xl px-6 py-4 focus:ring-4 focus:ring-green-500/10 outline-none transition-all text-center font-bold tracking-widest`}
                      autoFocus
                   />
                   {passwordError && <p className="text-red-500 text-xs font-bold animate-bounce">Incorrect Password!</p>}
                   <button 
                      type="submit"
                      className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black text-lg hover:bg-black transition-all shadow-xl active:scale-95"
                   >
                      Unlock Dashboard
                   </button>
                   <p className="text-[10px] text-gray-300 mt-4 uppercase tracking-tighter">Default Pass: owner123</p>
                </form>
             </div>
          </div>
        )}

        {view === 'admin' && isAdminAuthenticated && (
          <div className="animate-in slide-in-from-bottom-6 duration-500 space-y-12 pb-20">
            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-4">
                  <div className="bg-gray-800 p-3 rounded-2xl text-white shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-4xl font-black text-gray-900">Owner Dashboard</h2>
                    <p className="text-gray-500">Manage your store's inventory and add new products.</p>
                  </div>
               </div>
               <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 flex items-center gap-2 font-bold transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign Out
               </button>
            </div>

            <div className="grid lg:grid-cols-3 gap-12">
               <div className="lg:col-span-1">
                 <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 sticky top-32">
                   <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                     <span className="w-2 h-6 bg-green-500 rounded-full"></span>
                     Add New Fruit
                   </h3>
                   <div className="bg-green-50 rounded-2xl p-4 mb-6 border border-green-100">
                      <p className="text-xs text-green-700 font-bold uppercase tracking-wider mb-1">Owner Pro Tip</p>
                      <p className="text-xs text-green-600 leading-relaxed">Upload an image and Gemini AI will automatically fill the name and details for you!</p>
                   </div>
                   <form onSubmit={handleManualAdd} className="space-y-6">
                      <div className="space-y-2">
                         <label className="text-sm font-bold text-gray-600 px-1">Fruit Image</label>
                         <div 
                           className={`h-48 bg-gray-50 border-2 border-dashed ${isAdminIdentifying ? 'border-green-500 animate-pulse' : 'border-gray-200'} rounded-3xl flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer hover:border-green-400 transition-colors`}
                           onClick={() => document.getElementById('manual-upload')?.click()}
                         >
                            {newFruitImg ? (
                              <img src={newFruitImg} className="w-full h-full object-cover" />
                            ) : (
                              <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className="text-xs text-gray-400 mt-2 font-medium">Upload & Identify with AI</span>
                              </>
                            )}
                            {isAdminIdentifying && (
                              <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                                 <div className="flex flex-col items-center">
                                    <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                                    <span className="text-[10px] font-black text-green-700 uppercase">AI Identifying...</span>
                                 </div>
                              </div>
                            )}
                            <input id="manual-upload" type="file" className="hidden" accept="image/*" onChange={handleAdminFileChange} />
                         </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-600 px-1">Fruit Name</label>
                        <input 
                          type="text" 
                          value={newFruitName}
                          onChange={(e) => setNewFruitName(e.target.value)}
                          placeholder="AI detected name"
                          className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-green-500/20 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-600 px-1">Price per kg (₹)</label>
                        <input 
                          type="number" 
                          step="0.01"
                          value={newFruitPrice}
                          onChange={(e) => setNewFruitPrice(e.target.value)}
                          placeholder="Enter price"
                          className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-green-500/20 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-600 px-1">Description</label>
                        <textarea 
                          value={newFruitDesc}
                          onChange={(e) => setNewFruitDesc(e.target.value)}
                          placeholder="AI detected description"
                          rows={3}
                          className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-green-500/20 outline-none transition-all resize-none"
                        />
                      </div>
                      <button 
                        type="submit"
                        disabled={isAdminIdentifying}
                        className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black text-lg hover:bg-black transition-all shadow-xl active:scale-95 disabled:opacity-50"
                      >
                        Confirm & Add to Store
                      </button>
                   </form>
                 </div>
               </div>

               <div className="lg:col-span-2">
                  <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 min-h-[600px]">
                    <h3 className="text-2xl font-bold mb-8 flex items-center gap-2">
                      <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
                      Manage Inventory ({fruits.length} items)
                    </h3>
                    
                    <div className="space-y-4">
                      {fruits.length === 0 ? (
                        <div className="py-20 text-center text-gray-400">
                           No items in inventory.
                        </div>
                      ) : (
                        fruits.map(f => (
                          <div key={f.id} className="group flex items-center gap-6 p-4 rounded-3xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                             <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-sm flex-shrink-0">
                                <img src={f.image} className="w-full h-full object-cover" />
                             </div>
                             <div className="flex-1">
                                <h4 className="font-bold text-gray-900 text-lg">{f.name}</h4>
                                <div className="flex gap-4 text-sm font-medium">
                                   <span className="text-green-600">₹{f.price?.toFixed(2)}/kg</span>
                                   <span className="text-gray-400">Seller: {f.sellerName}</span>
                                </div>
                             </div>
                             <div className="flex gap-2">
                                <button 
                                  onClick={() => removeFruitFromStore(f.id)}
                                  className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all"
                                  title="Remove from store"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                             </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
               </div>
            </div>
          </div>
        )}

        {view === 'market' && (
          <div className="animate-in slide-in-from-bottom-6 duration-500">
             <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
                <div>
                   <h2 className="text-4xl font-extrabold text-gray-900 mb-2">Marketplace</h2>
                   <p className="text-gray-500">Fresh produce directly from sellers powered by AI verification.</p>
                </div>
                <button 
                  onClick={() => setIsSelling(true)}
                  className="bg-green-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-green-700 transition-all flex items-center gap-2 shadow-lg"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  AI Sell Assistant
                </button>
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {fruits.filter(f => f.isForSale).map(f => (
                   <MarketCard key={f.id} fruit={f} onAddToCart={addToCart} onClick={() => { setSelectedFruit(f); setView('details'); }} />
                ))}
             </div>
          </div>
        )}

        {isSelling && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={() => setIsSelling(false)}></div>
            <div className="relative bg-white w-full max-w-xl rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
               <button onClick={() => setIsSelling(false)} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
               <div className="text-center mb-10">
                 <div className="w-16 h-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>
                 </div>
                 <h3 className="text-3xl font-extrabold text-gray-900 mb-2">Sell with AI</h3>
                 <p className="text-gray-500">Snap a photo and Gemini AI will analyze the fruit and suggest a listing.</p>
               </div>

               <div className="border-4 border-dashed border-gray-100 rounded-[2rem] p-12 text-center group hover:border-green-100 transition-colors">
                 <input 
                   type="file" 
                   id="sell-upload" 
                   className="hidden" 
                   accept="image/*"
                   onChange={(e) => e.target.files && handleSellIdentify(e.target.files[0])}
                 />
                 <label htmlFor="sell-upload" className="cursor-pointer">
                    <div className="bg-green-600 text-white px-10 py-5 rounded-3xl font-bold shadow-lg inline-block mb-4">
                      {isIdentifying ? 'Analyzing...' : 'Choose Fruit Image'}
                    </div>
                    <p className="text-gray-400 text-sm">Gemini will detect name, nutrients, and suggest a price.</p>
                 </label>
               </div>
               
               {isIdentifying && (
                 <div className="mt-8 flex justify-center items-center gap-3 text-green-600 font-bold">
                   <div className="w-6 h-6 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                   AI Analysis in progress...
                 </div>
               )}
            </div>
          </div>
        )}

        {view === 'details' && selectedFruit && (
          <div className="animate-in fade-in duration-700">
            <button 
              onClick={() => setView(selectedFruit.isForSale ? 'market' : 'home')}
              className="mb-8 flex items-center gap-2 text-gray-500 hover:text-green-600 font-medium transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Back to List
            </button>
            <div className="grid md:grid-cols-2 gap-16">
              <div className="rounded-[4rem] overflow-hidden shadow-2xl h-[500px] sticky top-32">
                <img src={selectedFruit.image} alt={selectedFruit.name} className="w-full h-full object-cover" />
              </div>
              <div className="py-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-6xl font-black text-gray-900">{selectedFruit.name}</h2>
                  {selectedFruit.isForSale && (
                     <div className="text-4xl font-black text-green-600">₹{selectedFruit.price?.toFixed(2)}</div>
                  )}
                </div>
                <p className="text-2xl text-green-600 font-medium italic mb-10">{selectedFruit.scientificName}</p>
                
                {selectedFruit.isForSale && (
                   <button 
                    onClick={() => addToCart(selectedFruit)}
                    className="w-full mb-12 bg-green-600 text-white py-6 rounded-[2rem] text-xl font-black hover:bg-green-700 transition-all shadow-xl hover:translate-y-[-4px] active:translate-y-0"
                  >
                    Add to Basket
                  </button>
                )}

                <div className="space-y-12">
                  <section>
                    <h4 className="text-xl font-bold mb-6 flex items-center gap-2"><span className="w-3 h-8 bg-green-500 rounded-full"></span>Nutritional Overview</h4>
                    <NutritionChart nutrients={selectedFruit.nutrients} />
                  </section>
                  <section>
                    <h4 className="text-xl font-bold mb-6 flex items-center gap-2"><span className="w-3 h-8 bg-blue-500 rounded-full"></span>Key Benefits</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedFruit.benefits.map((b, i) => (
                        <div key={i} className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm font-medium text-gray-700">
                          {b}
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'assistant' && (
          <div className="max-w-4xl mx-auto flex flex-col h-[75vh] animate-in slide-in-from-right-10 duration-500">
            <div className="flex-1 bg-white rounded-[3rem] shadow-2xl border border-gray-100 overflow-hidden flex flex-col">
              <div className="bg-green-600 px-8 py-6 text-white flex items-center gap-4">
                 <div className="bg-white/20 p-3 rounded-2xl">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                 </div>
                 <div>
                   <h3 className="text-xl font-bold">Fruity Assistant</h3>
                   <p className="text-sm text-green-100 opacity-80">Nutritional advice & Market trends</p>
                 </div>
              </div>
              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                {chatMessages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <h4 className="text-gray-400 font-bold mb-6">Start a conversation</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
                      {["How should I price organic apples?", "Which fruits are best for energy?", "Market price for Alphonso Mangoes?"].map(q => (
                        <button key={q} onClick={() => setChatInput(q)} className="text-sm text-left bg-gray-50 hover:bg-green-50 hover:text-green-700 p-5 rounded-3xl transition-all border border-gray-100">
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] px-8 py-5 rounded-[2.5rem] ${msg.role === 'user' ? 'bg-green-600 text-white rounded-tr-none shadow-xl' : 'bg-gray-100 text-gray-800 rounded-tl-none'}`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-6 bg-gray-50 border-t border-gray-100">
                <div className="flex gap-4">
                  <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Ask anything about fruits or selling..."
                    className="flex-1 bg-white border border-gray-200 rounded-[2rem] px-8 py-5 focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all shadow-inner"
                  />
                  <button onClick={sendMessage} className="bg-green-600 text-white p-5 rounded-[2rem] hover:bg-green-700 transition-all shadow-xl active:scale-90">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'favorites' && (
          <div className="animate-in fade-in duration-500">
             <h2 className="text-4xl font-extrabold text-gray-900 mb-12">Your Favorites</h2>
             {favorites.length === 0 ? (
               <div className="bg-white rounded-[3rem] p-20 text-center border border-gray-100 shadow-sm">
                 <p className="text-gray-400 font-bold text-xl mb-8">Your favorite list is empty</p>
                 <button onClick={() => setView('home')} className="bg-green-600 text-white px-10 py-5 rounded-[2rem] font-bold shadow-lg">Start Exploring</button>
               </div>
             ) : (
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                 {fruits.filter(f => favorites.includes(f.id)).map(f => (
                   <MarketCard key={f.id} fruit={f} onAddToCart={addToCart} onClick={() => { setSelectedFruit(f); setView('details'); }} />
                 ))}
               </div>
             )}
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-gray-100 py-16 px-6 mt-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="max-w-xs">
             <div className="flex items-center gap-2 mb-6">
                <div className="bg-green-600 p-2 rounded-xl"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg></div>
                <span className="text-2xl font-black text-gray-900 tracking-tight">FruityVision</span>
             </div>
             <p className="text-gray-500 leading-relaxed">The smarter way to identify, buy, and sell high-quality fruits globally using Google Gemini AI.</p>
          </div>
          <div className="flex gap-20">
             <div className="space-y-4">
               <h5 className="font-bold text-gray-900">Market</h5>
               <ul className="text-gray-500 space-y-2">
                 <li><button onClick={() => setView('market')}>Marketplace</button></li>
                 <li><button onClick={() => setView('admin')}>Owner Dashboard</button></li>
                 <li><a href="#">Categories</a></li>
               </ul>
             </div>
             <div className="space-y-4">
               <h5 className="font-bold text-gray-900">Resources</h5>
               <ul className="text-gray-500 space-y-2">
                 <li><button onClick={() => setView('assistant')}>AI Assistant</button></li>
                 <li><a href="#">Healthy Tips</a></li>
                 <li><a href="#">Support</a></li>
               </ul>
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
