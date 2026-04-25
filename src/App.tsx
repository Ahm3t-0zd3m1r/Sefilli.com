/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Menu, X, Sun, Cloud, CloudRain, Wind, 
  TrendingUp, TrendingDown, Minus, 
  Image as ImageIcon, Video, MessageSquare, 
  Settings, Send, LogIn, LogOut, Trash2, Plus, Eye,
  ChevronRight, MapPin, Phone, Mail, Clock,
  Utensils, Search, Globe, Camera, Zap, Newspaper,
  CloudSun, AlertTriangle, ShoppingBag, BarChart3,
  Bot, ShoppingCart, FileText, MailCheck, Map as MapIcon,
  Moon, MessageCircle, Bell, Thermometer, Wind as WindIcon,
  Sparkles, History, Filter, ThumbsUp, MessageSquare as MessageSquareIcon,
  Upload, Calendar, Truck, Users, Droplets, Star, User as UserIcon,
  LayoutGrid, Lock as LockIcon, Sprout as SproutIcon, FlaskConical, BookOpen,
  Package, Share2, Tractor, Calculator, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  collection, onSnapshot, query, orderBy, 
  addDoc, deleteDoc, doc, updateDoc, setDoc,
  getDocFromServer, limit, where
} from 'firebase/firestore';
import { 
  signInWithPopup, GoogleAuthProvider, 
  onAuthStateChanged, signOut, User 
} from 'firebase/auth';
import { 
  ref, uploadBytes, getDownloadURL, uploadBytesResumable 
} from 'firebase/storage';
import { GoogleGenAI, Modality } from "@google/genai";
import imageCompression from 'browser-image-compression';
import { toast, Toaster } from 'sonner';
import { db, auth, storage } from './firebase';
import { BlogPost, CropPrice, GalleryItem, Comment, ContactMessage, WeatherData, HarvestEvent, StockItem, Recipe, DiseaseAnalysis, DiseaseAlert, ForumPost, ForumComment, WeatherAlert, HarvestPrediction, SoilAnalysis, MarketplaceItem, EquipmentListing, CustomerReview, IrrigationPlan, UserProfile, News, Expense, CropCycle, ChatMessage, Income, InventoryItem, RotationPlan, FeedPost, IrrigationLog, EquipmentBooking } from './types';
import { cn } from './lib/utils';
import ReactMarkdown from 'react-markdown';
import { handleFirestoreError, OperationType } from './lib/errorHandlers';
import PriceChart from './components/PriceChart';
import MiniPriceChart from './components/MiniPriceChart';
import LazySection from './components/LazySection';
import Header from './components/Header';
import Footer from './components/Footer';
import MarketDashboard from './components/MarketDashboard';
import SoilAnalysisCharts from './components/SoilAnalysisCharts';
import FarmerJournal from './components/FarmerJournal';
import FinancialDashboard from './components/FinancialDashboard';
import InventoryManager from './components/InventoryManager';
import RotationPlanner from './components/RotationPlanner';
import FarmerFeed from './components/FarmerFeed';
import IrrigationDashboard from './components/IrrigationDashboard';
import EquipmentRentalManager from './components/EquipmentRentalManager';
import { Type } from "@google/genai";

const GOOGLE_PROVIDER = new GoogleAuthProvider();

export default function App() {
  console.log("App component rendering...");
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [activeSection, setActiveSection] = useState('anasayfa');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [selectedCrop, setSelectedCrop] = useState<string>('Patates');
  const [aiQuery, setAiQuery] = useState('');
  const [language, setLanguage] = useState<'tr' | 'en' | 'de'>('tr');
  const [diseaseImage, setDiseaseImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  const isAdmin = useMemo(() => user?.email === 'ahm3t.07d3m1rr@gmail.com', [user]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  // Data States
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [cropPrices, setCropPrices] = useState<CropPrice[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [harvestEvents, setHarvestEvents] = useState<HarvestEvent[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [diseaseAnalyses, setDiseaseAnalyses] = useState<DiseaseAnalysis[]>([]);
  const [diseaseAlerts, setDiseaseAlerts] = useState<DiseaseAlert[]>([]);
  const [marketplaceItems, setMarketplaceItems] = useState<MarketplaceItem[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [aiWeatherAdvice, setAiWeatherAdvice] = useState<string | null>(null);
  const [isAiWeatherLoading, setIsAiWeatherLoading] = useState(false);
  const [farmerToolTab, setFarmerToolTab] = useState<'finance' | 'inventory' | 'destek' | 'rotation' | 'feed' | 'irrigation' | 'rental' | 'calendar' | 'ai' | 'map' | 'soil' | 'hasat' | 'don' | 'ilaclama'>('finance');

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [rotationPlans, setRotationPlans] = useState<RotationPlan[]>([]);
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>([]);
  const [irrigationLogs, setIrrigationLogs] = useState<IrrigationLog[]>([]);
  const [equipmentBookings, setEquipmentBookings] = useState<EquipmentBooking[]>([]);
  const [soilReports, setSoilReports] = useState<SoilAnalysis[]>([]);
  const [harvestPredictions, setHarvestPredictions] = useState<HarvestPrediction[]>([]);
  const [irrigationPlans, setIrrigationPlans] = useState<IrrigationPlan[]>([]);
  const [cropCycles, setCropCycles] = useState<CropCycle[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [weatherAlerts, setWeatherAlerts] = useState<WeatherAlert[]>([]);
  const [news, setNews] = useState<News[]>([]);

  // Form States
  const [newComment, setNewComment] = useState({ content: '', city: '' });
  const [newContact, setNewContact] = useState({ name: '', email: '', subject: '', message: '' });
  const [newPost, setNewPost] = useState({ title: '', content: '', imageUrl: '', author: '' });
  const [newPrice, setNewPrice] = useState({ name: '', cropName: '', price: 0, unit: 'kg', trend: 'stable' as const, city: 'Niğde' });
  const [newHarvest, setNewHarvest] = useState({ cropName: '', action: 'planting' as const, month: 0, description: '' });
  const [newStock, setNewStock] = useState({ name: '', quantity: '', price: 0, unit: 'ton', status: 'available' as const });
  const [newRecipe, setNewRecipe] = useState({ title: '', ingredients: '', instructions: '', imageUrl: '' });
  const [expenseForm, setExpenseForm] = useState({ category: 'mazot' as Expense['category'], amount: '', description: '' });
  const [cropForm, setCropForm] = useState({ cropName: '', plantingDate: '', notes: '' });
  const [showCropForm, setShowCropForm] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const chatEndRef = React.useRef<HTMLDivElement>(null);
  const [showFeedModal, setShowFeedModal] = useState(false);
  const [newSoilAnalysis, setNewSoilAnalysis] = useState({ reportUrl: '', analysisResult: '' });
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictionResult, setPredictionResult] = useState<HarvestPrediction | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [newPlanInput, setNewPlanInput] = useState({ cropType: '', fieldSize: 0, soilType: 'tınlı' });
  const [activePlan, setActivePlan] = useState<string | null>(null);
  const [newGallery, setNewGallery] = useState<{ type: 'image' | 'video', url: string, caption: string }>({ type: 'image', url: '', caption: '' });
  const [newMarketplaceItem, setNewMarketplaceItem] = useState({ 
    name: '', 
    description: '', 
    price: 0, 
    unit: 'ton', 
    category: 'sebze' as MarketplaceItem['category'], 
    imageUrl: '', 
    isAvailable: true,
    contactPhone: ''
  });

  // Chatbot State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [botMessages, setBotMessages] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  const [botInput, setBotInput] = useState('');
  const [isBotLoading, setIsBotLoading] = useState(false);
  const [diseaseFile, setDiseaseFile] = useState<File | null>(null);
  const [soilFile, setSoilFile] = useState<File | null>(null);

  // Order State
  const [selectedProduct, setSelectedProduct] = useState<StockItem | null>(null);
  const [orderForm, setOrderForm] = useState({ quantity: 1, name: '', phone: '' });
  const [isOrdering, setIsOrdering] = useState(false);

  // Newsletter State
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        return localStorage.getItem('theme') === 'dark' || 
          (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
      }
    } catch (e) {
      console.warn("localStorage access failed during init:", e);
    }
    return false;
  });

  // Forum State
  const [forumPosts, setForumPosts] = useState<ForumPost[]>([]);
  const [newForumPost, setNewForumPost] = useState({ title: '', content: '', category: 'genel' as ForumPost['category'] });
  const [forumCategory, setForumCategory] = useState<ForumPost['category'] | 'all'>('all');
  const [isForumModalOpen, setIsForumModalOpen] = useState(false);

  // Equipment & Labor State
  const [equipmentListings, setEquipmentListings] = useState<EquipmentListing[]>([]);
  const [newListing, setNewListing] = useState({ type: 'equipment' as EquipmentListing['type'], title: '', description: '', price: 0, unit: 'gün', contactPhone: '', imageUrl: '' });

  // Customer Reviews State
  const [customerReviews, setCustomerReviews] = useState<CustomerReview[]>([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '', imageUrl: '', targetUserId: '' });

  const [incomeForm, setIncomeForm] = useState({ cropName: '', amount: '', quantity: '', unit: 'kg', date: new Date().toISOString().split('T')[0] });
  const [inventoryForm, setInventoryForm] = useState({ name: '', category: 'gubre' as InventoryItem['category'], quantity: '', unit: 'kg', minThreshold: '' });
  const [feedForm, setFeedForm] = useState({ content: '', imageUrl: '' });
  const [irrigationForm, setIrrigationForm] = useState({ fieldId: '', amount: '', duration: '', date: new Date().toISOString().split('T')[0] });

  const [marketplaceSearch, setMarketplaceSearch] = useState('');
  const [marketplaceFilter, setMarketplaceFilter] = useState('hepsi');
  const [marketplaceViewMode, setMarketplaceViewMode] = useState<'list' | 'map'>('list');
  const [isLocationFilterActive, setIsLocationFilterActive] = useState(false);

  // New Features State
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
  const [locationFilter, setLocationFilter] = useState<{ lat: number, lng: number, radius: number } | null>(null);
  const [priceCity, setPriceCity] = useState('Niğde');
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Partial<UserProfile> | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !editingProfile) return;
    try {
      await setDoc(doc(db, 'userProfiles', user.uid), {
        ...editingProfile,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      toast.success("Profil güncellendi!");
      setShowProfileSettings(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'userProfiles');
    }
  };

  // Auth Listener
  useEffect(() => {
    console.log("Auth listener setup...");
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      console.log("Auth state changed:", u?.email);
      setUser(u);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Theme Effect
  useEffect(() => {
    try {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    } catch (e) {
      console.warn("localStorage access failed:", e);
    }
  }, [isDarkMode]);

  // Connection Test
  useEffect(() => {
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Firebase connection error. Check configuration.");
        }
      }
    };
    testConnection();
  }, []);

  // Real-time Listeners
  useEffect(() => {
    console.log("Setting up real-time listeners, isAuthReady:", isAuthReady);
    if (!isAuthReady) return;

    const qBlog = query(collection(db, 'blogPosts'), orderBy('createdAt', 'desc'));
    const unsubBlog = onSnapshot(qBlog, (snap) => {
      setBlogPosts(snap.docs.map(d => ({ id: d.id, ...d.data() } as BlogPost)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'blogPosts'));

    const qPrices = query(collection(db, 'cropPrices'), orderBy('updatedAt', 'desc'));
    const unsubPrices = onSnapshot(qPrices, (snap) => {
      setCropPrices(snap.docs.map(d => ({ id: d.id, ...d.data() } as CropPrice)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'cropPrices'));

    const qGallery = query(collection(db, 'galleryItems'), orderBy('createdAt', 'desc'));
    const unsubGallery = onSnapshot(qGallery, (snap) => {
      setGalleryItems(snap.docs.map(d => ({ id: d.id, ...d.data() } as GalleryItem)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'galleryItems'));

    const qComments = query(collection(db, 'comments'), orderBy('createdAt', 'desc'));
    const unsubComments = onSnapshot(qComments, (snap) => {
      setComments(snap.docs.map(d => ({ id: d.id, ...d.data() } as Comment)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'comments'));

    const qHarvest = query(collection(db, 'harvestEvents'), orderBy('month', 'asc'));
    const unsubHarvest = onSnapshot(qHarvest, (snap) => {
      setHarvestEvents(snap.docs.map(d => ({ id: d.id, ...d.data() } as HarvestEvent)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'harvestEvents'));

    const qStock = query(collection(db, 'stockItems'), orderBy('updatedAt', 'desc'));
    const unsubStock = onSnapshot(qStock, (snap) => {
      setStockItems(snap.docs.map(d => ({ id: d.id, ...d.data() } as StockItem)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'stockItems'));

    const qRecipes = query(collection(db, 'recipes'), orderBy('createdAt', 'desc'));
    const unsubRecipes = onSnapshot(qRecipes, (snap) => {
      setRecipes(snap.docs.map(d => ({ id: d.id, ...d.data() } as Recipe)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'recipes'));

    const qForum = query(collection(db, 'forumPosts'), orderBy('createdAt', 'desc'));
    const unsubForum = onSnapshot(qForum, (snap) => {
      setForumPosts(snap.docs.map(d => ({ id: d.id, ...d.data() } as ForumPost)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'forumPosts'));

    const qAlerts = query(collection(db, 'weatherAlerts'), where('expiresAt', '>', new Date().toISOString()));
    const unsubAlerts = onSnapshot(qAlerts, (snap) => {
      setWeatherAlerts(snap.docs.map(d => ({ id: d.id, ...d.data() } as WeatherAlert)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'weatherAlerts'));

    const qDiseaseAlerts = query(collection(db, 'diseaseAlerts'), where('expiresAt', '>', new Date().toISOString()));
    const unsubDiseaseAlerts = onSnapshot(qDiseaseAlerts, (snap) => {
      setDiseaseAlerts(snap.docs.map(d => ({ id: d.id, ...d.data() } as DiseaseAlert)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'diseaseAlerts'));

    let unsubAnalyses = () => {};
    if (user) {
      const qAnalyses = query(collection(db, 'diseaseAnalysis'), orderBy('createdAt', 'desc'), limit(10));
      unsubAnalyses = onSnapshot(qAnalyses, (snap) => {
        setDiseaseAnalyses(snap.docs.map(d => ({ id: d.id, ...d.data() } as DiseaseAnalysis)));
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'diseaseAnalysis'));
    }

    const qMarketplace = query(collection(db, 'marketplaceItems'), orderBy('createdAt', 'desc'));
    const unsubMarketplace = onSnapshot(qMarketplace, (snap) => {
      setMarketplaceItems(snap.docs.map(d => ({ id: d.id, ...d.data() } as MarketplaceItem)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'marketplaceItems'));

    const qEquipment = query(collection(db, 'equipmentListings'), orderBy('createdAt', 'desc'));
    const unsubEquipment = onSnapshot(qEquipment, (snap) => {
      setEquipmentListings(snap.docs.map(d => ({ id: d.id, ...d.data() } as EquipmentListing)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'equipmentListings'));

    const qReviews = query(collection(db, 'customerReviews'), orderBy('createdAt', 'desc'), limit(20));
    const unsubReviews = onSnapshot(qReviews, (snap) => {
      setCustomerReviews(snap.docs.map(d => ({ id: d.id, ...d.data() } as CustomerReview)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'customerReviews'));

    const qNews = query(collection(db, 'news'), orderBy('createdAt', 'desc'), limit(10));
    const unsubNews = onSnapshot(qNews, (snap) => {
      setNews(snap.docs.map(d => ({ id: d.id, ...d.data() } as News)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'news'));

    const unsubProfiles = onSnapshot(collection(db, 'userProfiles'), (snap) => {
      const profiles = snap.docs.map(d => ({ id: d.id, ...d.data() } as UserProfile));
      setUserProfiles(profiles);
      if (user) {
        const myProfile = profiles.find(p => p.userId === user.uid);
        setCurrentUserProfile(myProfile || null);
      }
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'userProfiles'));

    let unsubExpenses = () => {};
    let unsubCycles = () => {};
    let unsubChat = () => {};

    if (user) {
      const qExpenses = query(collection(db, 'expenses'), where('userId', '==', user.uid), orderBy('date', 'desc'));
      unsubExpenses = onSnapshot(qExpenses, (snap) => {
        setExpenses(snap.docs.map(d => ({ id: d.id, ...d.data() } as Expense)));
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'expenses'));

      const qCycles = query(collection(db, 'cropCycles'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
      unsubCycles = onSnapshot(qCycles, (snap) => {
        setCropCycles(snap.docs.map(d => ({ id: d.id, ...d.data() } as CropCycle)));
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'cropCycles'));

      const qChat = query(collection(db, 'chatMessages'), where('userId', '==', user.uid), orderBy('createdAt', 'asc'));
      unsubChat = onSnapshot(qChat, (snap) => {
        setChatMessages(snap.docs.map(d => ({ id: d.id, ...d.data() } as ChatMessage)));
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'chatMessages'));

      const qPredictions = query(collection(db, 'harvestPredictions'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
      const unsubPredictions = onSnapshot(qPredictions, (snap) => {
        setHarvestPredictions(snap.docs.map(d => ({ id: d.id, ...d.data() } as HarvestPrediction)));
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'harvestPredictions'));

      const qSoil = query(collection(db, 'soilAnalysis'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
      const unsubSoil = onSnapshot(qSoil, (snap) => {
        setSoilReports(snap.docs.map(d => ({ id: d.id, ...d.data() } as SoilAnalysis)));
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'soilAnalysis'));

      const qPlans = query(collection(db, 'irrigationPlans'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
      const unsubPlans = onSnapshot(qPlans, (snap) => {
        setIrrigationPlans(snap.docs.map(d => ({ id: d.id, ...d.data() } as IrrigationPlan)));
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'irrigationPlans'));

      const qIncome = query(collection(db, 'income'), where('userId', '==', user.uid), orderBy('date', 'desc'));
      const unsubIncome = onSnapshot(qIncome, (snap) => {
        setIncomes(snap.docs.map(d => ({ id: d.id, ...d.data() } as Income)));
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'income'));

      const qInventory = query(collection(db, 'inventory'), where('userId', '==', user.uid), orderBy('updatedAt', 'desc'));
      const unsubInventory = onSnapshot(qInventory, (snap) => {
        setInventoryItems(snap.docs.map(d => ({ id: d.id, ...d.data() } as InventoryItem)));
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'inventory'));

      const qRotation = query(collection(db, 'rotationPlans'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
      const unsubRotation = onSnapshot(qRotation, (snap) => {
        setRotationPlans(snap.docs.map(d => ({ id: d.id, ...d.data() } as RotationPlan)));
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'rotationPlans'));

      const qFeed = query(collection(db, 'feedPosts'), orderBy('createdAt', 'desc'), limit(50));
      const unsubFeed = onSnapshot(qFeed, (snap) => {
        setFeedPosts(snap.docs.map(d => ({ id: d.id, ...d.data() } as FeedPost)));
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'feedPosts'));

      const qIrrigationLogs = query(collection(db, 'irrigationLogs'), where('userId', '==', user.uid), orderBy('date', 'desc'));
      const unsubIrrigationLogs = onSnapshot(qIrrigationLogs, (snap) => {
        setIrrigationLogs(snap.docs.map(d => ({ id: d.id, ...d.data() } as IrrigationLog)));
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'irrigationLogs'));

      const qBookings = query(collection(db, 'equipmentBookings'), where('ownerId', '==', user.uid));
      const unsubBookings = onSnapshot(qBookings, (snap) => {
        setEquipmentBookings(snap.docs.map(d => ({ id: d.id, ...d.data() } as EquipmentBooking)));
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'equipmentBookings'));

      return () => {
        unsubBlog();
        unsubPrices();
        unsubGallery();
        unsubComments();
        unsubHarvest();
        unsubStock();
        unsubRecipes();
        unsubForum();
        unsubAlerts();
        unsubDiseaseAlerts();
        unsubAnalyses();
        unsubMarketplace();
        unsubEquipment();
        unsubReviews();
        unsubNews();
        unsubProfiles();
        unsubExpenses();
        unsubCycles();
        unsubChat();
        unsubPredictions();
        unsubSoil();
        unsubPlans();
        unsubIncome();
        unsubInventory();
        unsubRotation();
        unsubFeed();
        unsubIrrigationLogs();
        unsubBookings();
      };
    }

    return () => {
      unsubBlog();
      unsubPrices();
      unsubGallery();
      unsubComments();
      unsubHarvest();
      unsubStock();
      unsubRecipes();
      unsubForum();
      unsubAlerts();
      unsubAnalyses();
      unsubMarketplace();
      unsubEquipment();
      unsubReviews();
      unsubNews();
      unsubProfiles();
    };
  }, [isAuthReady, user]);

  // Profile Creation/Update Effect
  useEffect(() => {
    const syncProfile = async () => {
      if (user && isAuthReady) {
        const profileRef = collection(db, 'userProfiles');
        const q = query(profileRef, where('userId', '==', user.uid));
        const snap = await getDocFromServer(doc(db, 'userProfiles', user.uid)).catch(() => null);
        
        // Check if profile exists using query since we use auto-id or specific id
        // Actually, let's use user.uid as the document ID for simplicity
        const docRef = doc(db, 'userProfiles', user.uid);
        const docSnap = await getDocFromServer(docRef).catch(() => null);

        if (!docSnap?.exists()) {
          await addDoc(collection(db, 'userProfiles'), {
            userId: user.uid,
            displayName: user.displayName || user.email?.split('@')[0] || 'Çiftçi',
            role: 'farmer',
            reliabilityScore: 5.0,
            totalSales: 0,
            photoUrl: user.photoURL || '',
            createdAt: new Date().toISOString()
          }).catch(err => console.error("Profile creation error:", err));
        }
      }
    };
    syncProfile();
  }, [user, isAuthReady]);

  // Weather Fetching
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch('https://wttr.in/Nigde?format=j1');
        const data = await res.json();
        const current = data.current_condition[0];
        const weatherData = {
          temp: parseInt(current.temp_C),
          condition: current.lang_tr?.[0]?.value || current.weatherDesc[0].value,
          icon: 'sun', // Simplified icon mapping
          city: 'Niğde',
          humidity: parseInt(current.humidity),
          windSpeed: parseInt(current.windspeedKmph)
        };
        setWeather(weatherData);
        
        // Fetch AI Advice
        setIsAiWeatherLoading(true);
        try {
          const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
          const response = await ai.models.generateContent({
            model: "gemini-3.1-pro-preview",
            contents: `Hava Durumu: ${weatherData.temp}°C, ${weatherData.condition}, Nem: %${weatherData.humidity}, Rüzgar: ${weatherData.windSpeed} km/s. 
            Bu hava durumuna göre Niğde İçmeli Köyü'ndeki bir çiftçiye (patates, buğday, arpa, fasulye yetiştiren) bugün için 1-2 cümlelik kısa ve samimi bir tavsiye ver.`,
          });
          setAiWeatherAdvice(response.text);
        } catch (aiErr) {
          console.error("AI Weather Advice error:", aiErr);
        } finally {
          setIsAiWeatherLoading(false);
        }
      } catch (error) {
        console.error("Weather fetch error:", error);
        // Fallback to mock data if API fails
        setWeather({
          temp: 18,
          condition: 'Parçalı Bulutlu',
          icon: 'cloud',
          city: 'Niğde',
          humidity: 45,
          windSpeed: 12
        });
      }
    };
    fetchWeather();
    // Refresh every 30 minutes
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, GOOGLE_PROVIDER);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c; // Distance in km
    return d;
  };

    const handleFileUpload = async (file: File, path: string, skipCompression = false): Promise<string> => {
      if (!storage) {
        toast.error("Depolama servisi hazır değil.");
        throw new Error("Storage not initialized");
      }
      
      if (!auth.currentUser) {
        toast.error("Dosya yüklemek için giriş yapmalısınız.");
        throw new Error("User not authenticated");
      }

      setIsUploading(true);
      const uploadToast = toast.loading(`${file.name} hazırlanıyor...`);
      console.log(`Starting upload for ${file.name} to ${path}...`);
      
      try {
        let fileToUpload = file;
        
        // Optimized compression for faster uploads
        if (file.type.startsWith('image/') && !skipCompression) {
          const originalSize = file.size / 1024 / 1024;
          // Only compress if larger than 300KB
          if (file.size > 300 * 1024) {
            toast.loading(`${file.name} sıkıştırılıyor...`, { id: uploadToast });
            console.log(`Compressing image: ${file.name} (${originalSize.toFixed(2)} MB)`);
            const options = {
              maxSizeMB: 0.8, // Daha hızlı işlem için hedef boyutu artırıldı
              maxWidthOrHeight: 1280, // Makul bir çözünürlük
              useWebWorker: true,
              initialQuality: 0.7, // Daha hızlı sıkıştırma için kalite dengelendi
            };
            try {
              fileToUpload = await imageCompression(file, options);
              console.log(`Compression successful: ${(fileToUpload.size / 1024 / 1024).toFixed(2)} MB`);
            } catch (compressionError) {
              console.warn("Compression failed, uploading original file:", compressionError);
              fileToUpload = file;
            }
          }
        }
        
        toast.loading(`${file.name} yükleniyor...`, { id: uploadToast });
        const sanitizedName = file.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
        const fileName = `${Date.now()}_${sanitizedName}`;
        const storageRef = ref(storage, `${path}/${fileName}`);
        
        console.log(`Uploading to: ${path}/${fileName}`);
        
        // Use uploadBytesResumable for better progress tracking (even if we just log it)
        const uploadTask = uploadBytesResumable(storageRef, fileToUpload);
        
        const downloadUrl = await new Promise<string>((resolve, reject) => {
          uploadTask.on('state_changed', 
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              console.log(`Upload is ${progress.toFixed(2)}% done`);
              if (progress > 0 && progress < 100) {
                toast.loading(`${file.name} yükleniyor: %${progress.toFixed(0)}`, { id: uploadToast });
              }
            }, 
            (error: any) => {
              console.error("Upload task error details:", error);
              toast.dismiss(uploadToast);
              reject(error);
            }, 
            async () => {
              try {
                const url = await getDownloadURL(uploadTask.snapshot.ref);
                console.log("File uploaded successfully:", url);
                toast.success(`${file.name} başarıyla yüklendi!`, { id: uploadToast });
                resolve(url);
              } catch (urlError) {
                console.error("Error getting download URL:", urlError);
                reject(urlError);
              }
            }
          );
        });

        return downloadUrl;
      } catch (error: any) {
        toast.dismiss(uploadToast);
        console.error("File upload error details:", error);
        // ... error handling continues ...
        if (error.code === 'storage/unauthorized') {
          toast.error("Dosya yükleme yetkiniz yok. Lütfen giriş yaptığınızdan emin olun.");
        } else if (error.code === 'storage/quota-exceeded') {
          toast.error("Depolama kotası doldu.");
        } else if (error.code === 'storage/canceled') {
          toast.error("Yükleme iptal edildi.");
        } else if (error.code === 'storage/unknown') {
          toast.error("Bilinmeyen bir hata oluştu. Lütfen internet bağlantınızı kontrol edin.");
        } else {
          toast.error(`Dosya yüklenirken hata oluştu: ${error.message || 'Bilinmeyen hata'}`);
        }
        throw error;
      } finally {
        setIsUploading(false);
      }
    };

  const handleDelete = async (collectionName: string, id: string, ownerId?: string) => {
    if (!isAdmin && ownerId && ownerId !== user?.uid) {
      toast.error("Bu işlemi yapmaya yetkiniz yok.");
      return;
    }
    if (!window.confirm("Bu öğeyi silmek istediğinizden emin misiniz?")) return;
    try {
      await deleteDoc(doc(db, collectionName, id));
      toast.success("Öğe başarıyla silindi.");
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, collectionName);
    }
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  // Submit Handlers
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.content) return;
    try {
      await addDoc(collection(db, 'comments'), {
        postId: 'general',
        userId: user.uid, // Added
        userName: user.displayName || 'Anonim',
        content: newComment.content,
        city: newComment.city || 'Bilinmiyor',
        likes: 0,
        createdAt: new Date().toISOString()
      });
      setNewComment({ content: '', city: '' });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'comments');
    }
  };

  const handleSubmitContact = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'contactMessages'), {
        ...newContact,
        createdAt: new Date().toISOString()
      });
      setNewContact({ name: '', email: '', subject: '', message: '' });
      toast.success("Mesajınız gönderildi!");
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'contactMessages');
    }
  };

  const handleAddBlogPost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'blogPosts'), {
        ...newPost,
        createdAt: new Date().toISOString()
      });
      setNewPost({ title: '', content: '', imageUrl: '', author: '' });
      toast.success("Yazı eklendi!");
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'blogPosts');
    }
  };

  const handleAddCropPrice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const history = [{ date: new Date().toISOString().split('T')[0], price: newPrice.price }];
      await addDoc(collection(db, 'cropPrices'), {
        ...newPrice,
        cropName: newPrice.name,
        updatedAt: new Date().toISOString(),
        history
      });
      setNewPrice({ name: '', cropName: '', price: 0, unit: 'kg', trend: 'stable', city: 'Niğde' });
      toast.success("Fiyat eklendi!");
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'cropPrices');
    }
  };

  const handleAddHarvest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'harvestEvents'), newHarvest);
      setNewHarvest({ cropName: '', action: 'planting', month: 0, description: '' });
      toast.success("Takvim etkinliği eklendi!");
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'harvestEvents');
    }
  };

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'stockItems'), {
        ...newStock,
        updatedAt: new Date().toISOString()
      });
      setNewStock({ name: '', quantity: '', price: 0, unit: 'ton', status: 'available' });
      toast.success("Stok eklendi!");
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'stockItems');
    }
  };

  const handleAddRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'recipes'), {
        ...newRecipe,
        ingredients: newRecipe.ingredients.split(',').map(i => i.trim()),
        createdAt: new Date().toISOString()
      });
      setNewRecipe({ title: '', ingredients: '', instructions: '', imageUrl: '' });
      toast.success("Tarif eklendi!");
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'recipes');
    }
  };

  const handleAddMarketplaceItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("İlan vermek için giriş yapmalısınız.");
      return;
    }
    try {
      // Get user location for the item
      let lat = 37.9667; // Default Niğde
      let lng = 34.6833;

      if ("geolocation" in navigator) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });
          lat = position.coords.latitude;
          lng = position.coords.longitude;
        } catch (err) {
          console.log("Using default location for marketplace item");
        }
      }

      await addDoc(collection(db, 'marketplaceItems'), {
        ...newMarketplaceItem,
        userId: user.uid,
        userName: user.displayName || user.email?.split('@')[0] || 'Çiftçi',
        latitude: lat,
        longitude: lng,
        createdAt: new Date().toISOString()
      });
      setNewMarketplaceItem({ name: '', description: '', price: 0, unit: 'ton', category: 'sebze', imageUrl: '', isAvailable: true, contactPhone: '' });
      toast.success("Ürün pazara eklendi!");
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'marketplaceItems');
    }
  };

  const handleDiseaseAnalysis = async (file: File) => {
    if (!user) return;
    setIsAnalyzing(true);
    setAnalysisResult(null);
    try {
      // Compress for AI and storage (one-time compression)
      const options = {
        maxSizeMB: 0.8,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
        initialQuality: 0.7,
      };
      const compressedFile = await imageCompression(file, options);
      
      // Convert to base64 for Gemini
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(compressedFile);
      });
      const base64String = await base64Promise;

      // Upload the ALREADY COMPRESSED file to storage for record
      const imageUrl = await handleFileUpload(compressedFile, 'disease-analysis', true);

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: [
          {
            inlineData: {
              data: base64String.split(',')[1],
              mimeType: "image/jpeg"
            }
          },
          { text: "Bu bitki yaprağındaki hastalığı teşhis et. Hastalığın adını, nedenini ve organik/kimyasal çözüm önerilerini Türkçe olarak açıkla. Niğde İçmeli Köyü şartlarını göz önünde bulundur." }
        ],
      });
      const result = response.text;
      setAnalysisResult(result);
      
      // Extract structured info for regional alert
      try {
        const alertAi = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
        const alertResponse = await alertAi.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `Aşağıdaki analiz sonucundan hastalığın adını, hangi üründe olduğunu ve ciddiyetini (low, medium, high, critical) JSON olarak çıkar. Analiz: ${result}`,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                diseaseName: { type: Type.STRING },
                cropType: { type: Type.STRING },
                severity: { type: Type.STRING, enum: ['low', 'medium', 'high', 'critical'] }
              },
              required: ["diseaseName", "cropType", "severity"]
            }
          }
        });
        
        const alertData = JSON.parse(alertResponse.text);
        
        // If severity is high or critical, create a regional alert
        if (alertData.severity === 'high' || alertData.severity === 'critical') {
          await addDoc(collection(db, 'diseaseAlerts'), {
            diseaseName: alertData.diseaseName,
            cropType: alertData.cropType,
            severity: alertData.severity,
            location: currentUserProfile?.locationName || 'Niğde İçmeli',
            description: `${alertData.cropType} ürününde ${alertData.diseaseName} tespit edildi. Bölgedeki çiftçilerin dikkatine!`,
            reportedBy: user.displayName || 'Bir Çiftçi',
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
          });
          toast.warning("⚠️ Yüksek riskli hastalık tespit edildi! Bölgesel alarm oluşturuldu.");
        }
      } catch (err) {
        console.warn("Could not create regional alert:", err);
      }

      await addDoc(collection(db, 'diseaseAnalysis'), {
        imageUrl,
        result,
        userId: user.uid,
        createdAt: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Analysis error:", error);
      if (error?.message?.includes('quota') || error?.message?.includes('429')) {
        setAnalysisResult("⚠️ Ücretsiz kullanım kotası doldu. Lütfen 1-2 dakika bekleyip tekrar deneyin.");
        toast.error("Yapay zeka kotası doldu. Lütfen biraz bekleyin.");
      } else {
        setAnalysisResult("Analiz sırasında bir hata oluştu. Lütfen internet bağlantınızı kontrol edip tekrar deneyin.");
        toast.error("Analiz başarısız oldu.");
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNewsletterSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setIsSubscribing(true);
    try {
      await addDoc(collection(db, 'newsletter'), {
        email: newsletterEmail,
        createdAt: new Date().toISOString()
      });
      toast.success('Bültene başarıyla abone oldunuz!');
      setNewsletterEmail('');
    } catch (error) {
      console.error("Newsletter error:", error);
      toast.error('Bir hata oluştu.');
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !expenseForm.amount || !expenseForm.description) return;

    try {
      await addDoc(collection(db, 'expenses'), {
        userId: user.uid,
        category: expenseForm.category,
        amount: parseFloat(expenseForm.amount),
        description: expenseForm.description,
        date: new Date().toISOString(),
        createdAt: new Date().toISOString()
      });
      toast.success('Gider başarıyla eklendi.');
      setExpenseForm({ category: 'mazot', amount: '', description: '' });
    } catch (error) {
      console.error("Add expense error:", error);
      toast.error('Gider eklenirken bir hata oluştu.');
    }
  };

  const handleAddCropCycle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !cropForm.cropName || !cropForm.plantingDate) return;

    try {
      await addDoc(collection(db, 'cropCycles'), {
        userId: user.uid,
        cropName: cropForm.cropName,
        plantingDate: cropForm.plantingDate,
        notes: cropForm.notes,
        status: 'active',
        createdAt: new Date().toISOString()
      });
      toast.success('Ekim döngüsü başarıyla oluşturuldu.');
      setCropForm({ cropName: '', plantingDate: '', notes: '' });
      setShowCropForm(false);
    } catch (error) {
      console.error("Add crop cycle error:", error);
      toast.error('Ekim döngüsü oluşturulurken bir hata oluştu.');
    }
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !chatInput.trim() || isChatting) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    setIsChatting(true);

    try {
      // Save user message
      await addDoc(collection(db, 'chatMessages'), {
        userId: user.uid,
        role: 'user',
        content: userMessage,
        createdAt: new Date().toISOString()
      });

      // Get chat history for context
      const history = chatMessages.slice(-5).map(msg => `${msg.role === 'user' ? 'Kullanıcı' : 'Asistan'}: ${msg.content}`).join('\n');

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Sen Sefilli.com'un uzman ziraat danışmanısın. Çiftçilere toprak, gübreleme, hastalıklar ve modern tarım teknikleri hakkında profesyonel, nazik ve yardımcı bir dille tavsiyeler veriyorsun.
        
        Sohbet Geçmişi:
        ${history}
        
        Kullanıcı Sorusu: ${userMessage}`,
        config: {
          systemInstruction: "Kısa, öz ve uygulanabilir tarım tavsiyeleri ver. Teknik terimleri açıkla. Her zaman çiftçinin verimini artırmayı hedefle."
        }
      });

      const aiResponse = response.text || "Üzgünüm, şu an yanıt veremiyorum. Lütfen tekrar deneyin.";

      // Save AI message
      await addDoc(collection(db, 'chatMessages'), {
        userId: user.uid,
        role: 'model',
        content: aiResponse,
        createdAt: new Date().toISOString()
      });

    } catch (error) {
      console.error("Chat error:", error);
      toast.error('AI yanıtı alınırken bir hata oluştu.');
    } finally {
      setIsChatting(false);
    }
  };

  const handleAddListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await addDoc(collection(db, 'equipmentListings'), {
        ...newListing,
        userId: user.uid,
        userName: user.displayName || 'Anonim Çiftçi',
        createdAt: new Date().toISOString(),
        isAvailable: true
      });
      setNewListing({ type: 'equipment', title: '', description: '', price: 0, unit: 'gün', contactPhone: '', imageUrl: '' });
      toast.success("İlan başarıyla eklendi!");
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'equipmentListings');
    }
  };

  const handleAddReview = async (e: React.FormEvent, targetUserId?: string) => {
    e.preventDefault();
    if (!user) {
      toast.error("Yorum yapmak için giriş yapmalısınız.");
      return;
    }
    try {
      await addDoc(collection(db, 'customerReviews'), {
        ...newReview,
        targetUserId: targetUserId || newReview.targetUserId || '',
        userId: user.uid,
        userName: user.displayName || 'Değerli Müşterimiz',
        userPhoto: user.photoURL || '',
        createdAt: new Date().toISOString()
      });
      setNewReview({ rating: 5, comment: '', imageUrl: '', targetUserId: '' });
      toast.success("Yorumunuz için teşekkürler!");
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'customerReviews');
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!botInput.trim() || isBotLoading) return;

    const userMsg = botInput;
    setBotMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setBotInput('');
    setIsBotLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          { text: `Sen Sefilli.com'un akıllı tarım asistanısın. Niğde İçmeli Köyü'ndeki çiftliğimiz hakkında bilgi veriyorsun. Kullanıcıya tarım, ürünlerimiz, fiyatlar ve köyümüz hakkında yardımcı ol. Kısa ve öz cevaplar ver. Kullanıcı sorusu: ${userMsg}` }
        ],
      });
      setBotMessages(prev => [...prev, { role: 'model', text: response.text || 'Üzgünüm, şu an cevap veremiyorum.' }]);
    } catch (error) {
      console.error("Chat error:", error);
      setBotMessages(prev => [...prev, { role: 'model', text: 'Bir bağlantı hatası oluştu.' }]);
    } finally {
      setIsBotLoading(false);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !user) return;
    setIsOrdering(true);
    try {
      await addDoc(collection(db, 'orders'), {
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        quantity: orderForm.quantity,
        customerName: orderForm.name,
        customerPhone: orderForm.phone,
        userId: user.uid,
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      toast.success('Sipariş talebiniz alındı! Sizinle en kısa sürede iletişime geçeceğiz.');
      setSelectedProduct(null);
      setOrderForm({ quantity: 1, name: '', phone: '' });
    } catch (error) {
      console.error("Order error:", error);
      toast.error('Sipariş sırasında bir hata oluştu.');
    } finally {
      setIsOrdering(false);
    }
  };

  const handleAddGalleryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'galleryItems'), {
        ...newGallery,
        userId: user?.uid, // Added
        createdAt: new Date().toISOString()
      });
      setNewGallery({ type: 'image', url: '', caption: '' });
      toast.success("Medya eklendi!");
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'galleryItems');
    }
  };

  const handleForumPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newForumPost.title || !newForumPost.content) return;
    try {
      await addDoc(collection(db, 'forumPosts'), {
        ...newForumPost,
        authorId: user.uid,
        authorName: user.displayName || 'Anonim Çiftçi',
        createdAt: new Date().toISOString(),
        likes: [],
        commentCount: 0
      });
      setNewForumPost({ title: '', content: '', category: 'genel' });
      setIsForumModalOpen(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'forumPosts');
    }
  };

  const handleForumLike = async (postId: string, currentLikes: string[]) => {
    if (!user) return;
    const isLiked = currentLikes.includes(user.uid);
    const newLikes = isLiked 
      ? currentLikes.filter(id => id !== user.uid)
      : [...currentLikes, user.uid];
    
    try {
      await updateDoc(doc(db, 'forumPosts', postId), { likes: newLikes });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'forumPosts');
    }
  };

  const handleLikeComment = async (id: string, currentLikes: number) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'comments', id), {
        likes: currentLikes + 1
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'comments');
    }
  };

  const handleAiConsultant = async () => {
    if (!aiQuery.trim()) return;
    setIsAiLoading(true);
    setAiResponse(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: aiQuery,
        config: {
          systemInstruction: `Sen Niğde İçmeli Köyü'nde bulunan "Sefilli.com"un uzman tarım danışmanısın. 
          Çiftliğimizde ağırlıklı olarak patates, buğday, arpa ve fasulye yetiştiriyoruz. 
          Niğde'nin karasal iklimine (soğuk kışlar, sıcak ve kurak yazlar) hakimsin. 
          Çiftçilere ekim, gübreleme, sulama, hastalıklarla mücadele ve hasat konularında bilimsel ve yerel tecrübeye dayalı tavsiyeler veriyorsun. 
          Cevapların kısa, öz ve samimi bir dille (Anadolu ağzına hafif göz kırparak) olmalı. 
          Eğer soru tarım dışındaysa, nazikçe konuyu tarıma veya çiftliğimize çek.`
        }
      });
      setAiResponse(response.text);
    } catch (error) {
      console.error("AI error:", error);
      setAiResponse("Üzgünüm, şu an yanıt veremiyorum. Lütfen daha sonra tekrar deneyin.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleTextToSpeech = async (text: string) => {
    if (!text) return;
    const toastId = toast.loading("Ses oluşturuluyor...");
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Lütfen şu metni samimi bir dille seslendir: ${text}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const audio = new Audio(`data:audio/wav;base64,${base64Audio}`);
        audio.play();
        toast.success("Ses çalınıyor...", { id: toastId });
      } else {
        throw new Error("Audio data not found");
      }
    } catch (error) {
      console.error("TTS error:", error);
      toast.error("Ses oluşturulurken bir hata oluştu.", { id: toastId });
    }
  };

  const handleHarvestPrediction = async (file: File) => {
    if (!user) return;
    setIsPredicting(true);
    try {
      const base64 = await fileToBase64(file);
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: {
          parts: [
            { inlineData: { data: base64, mimeType: file.type } },
            { text: "Bu mahsulün fotoğrafını analiz et. Hasat için ne kadar süre kaldığını, olgunluk seviyesini ve verim artırmak için ne yapılması gerektiğini söyle." }
          ]
        }
      });

      const result = response.text || "Analiz yapılamadı.";
      const imageUrl = await handleFileUpload(file, 'predictions');

      const prediction: HarvestPrediction = {
        id: '',
        imageUrl,
        cropType: selectedCrop,
        maturityLevel: result.slice(0, 50) + "...",
        recommendation: result,
        userId: user.uid,
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'harvestPredictions'), prediction);
      setPredictionResult(prediction);
      toast.success("Hasat tahmini tamamlandı!");
    } catch (error) {
      console.error("Prediction error:", error);
      toast.error("Tahmin sırasında bir hata oluştu.");
    } finally {
      setIsPredicting(false);
    }
  };

  const handleSoilAnalysisUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newSoilAnalysis.reportUrl || !soilFile) return;
    setIsAnalyzing(true);
    try {
      const base64 = await fileToBase64(soilFile);
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      
      // Multimodal analysis
      const textResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [
          { inlineData: { data: base64, mimeType: soilFile.type } },
          { text: "Bu toprak analizi raporunu yorumla. Hangi gübreler kullanılmalı, hangi ürünler ekilmeli? Niğde şartlarını göz önünde bulundur." }
        ]
      });

      const result = textResponse.text || "Yorum yapılamadı.";

      // Second, try to extract structured data for charts
      let structuredData = null;
      try {
        const dataResponse = await ai.models.generateContent({
          model: "gemini-2.5-flash-preview-tts",
          contents: [
            { inlineData: { data: base64, mimeType: soilFile.type } },
            { text: "Aşağıdaki toprak analizi raporundan şu değerleri sayısal olarak çıkar (0-100 arası normalize et, pH 0-14 arası kalsın): pH, azot, fosfor, potasyum, organik madde. Sadece JSON formatında yanıt ver." }
          ],
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                pH: { type: Type.NUMBER },
                nitrogen: { type: Type.NUMBER },
                phosphorus: { type: Type.NUMBER },
                potassium: { type: Type.NUMBER },
                organicMatter: { type: Type.NUMBER }
              },
              required: ["pH", "nitrogen", "phosphorus", "potassium", "organicMatter"]
            }
          }
        });
        structuredData = JSON.parse(dataResponse.text);
      } catch (err) {
        console.warn("Could not extract structured soil data:", err);
      }

      await addDoc(collection(db, 'soilAnalysis'), {
        ...newSoilAnalysis,
        analysisResult: result,
        data: structuredData,
        userId: user.uid,
        createdAt: new Date().toISOString()
      });
      setNewSoilAnalysis({ reportUrl: '', analysisResult: '' });
      toast.success("Toprak analizi kaydedildi!");
    } catch (error) {
      console.error("Soil analysis error:", error);
      toast.error("Analiz sırasında bir hata oluştu.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await addDoc(collection(db, 'income'), {
        userId: user.uid,
        cropName: incomeForm.cropName,
        amount: parseFloat(incomeForm.amount),
        quantity: parseFloat(incomeForm.quantity),
        unit: incomeForm.unit,
        date: incomeForm.date,
        createdAt: new Date().toISOString()
      });
      setIncomeForm({ cropName: '', amount: '', quantity: '', unit: 'kg', date: new Date().toISOString().split('T')[0] });
      toast.success("Gelir kaydı eklendi!");
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'income');
    }
  };

  const handleAddInventoryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await addDoc(collection(db, 'inventory'), {
        userId: user.uid,
        name: inventoryForm.name,
        category: inventoryForm.category,
        quantity: parseFloat(inventoryForm.quantity),
        unit: inventoryForm.unit,
        minThreshold: parseFloat(inventoryForm.minThreshold),
        updatedAt: new Date().toISOString()
      });
      setInventoryForm({ name: '', category: 'gubre', quantity: '', unit: 'kg', minThreshold: '' });
      toast.success("Ambar kaydı eklendi!");
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'inventory');
    }
  };

  const handleUpdateInventoryQuantity = async (id: string, newQuantity: number) => {
    try {
      await updateDoc(doc(db, 'inventory', id), {
        quantity: newQuantity,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'inventory');
    }
  };

  const handleAddFeedPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await addDoc(collection(db, 'feedPosts'), {
        userId: user.uid,
        userName: user.displayName || 'Çiftçi',
        userPhoto: user.photoURL || '',
        content: feedForm.content,
        imageUrl: feedForm.imageUrl,
        likes: [],
        commentCount: 0,
        createdAt: new Date().toISOString()
      });
      setFeedForm({ content: '', imageUrl: '' });
      toast.success("Paylaşıldı!");
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'feedPosts');
    }
  };

  const handleLikeFeedPost = async (id: string) => {
    if (!user) return;
    const post = feedPosts.find(p => p.id === id);
    if (!post) return;
    
    const newLikes = post.likes.includes(user.uid) 
      ? post.likes.filter(uid => uid !== user.uid)
      : [...post.likes, user.uid];

    try {
      await updateDoc(doc(db, 'feedPosts', id), { likes: newLikes });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'feedPosts');
    }
  };

  const handleAddIrrigationLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await addDoc(collection(db, 'irrigationLogs'), {
        userId: user.uid,
        fieldId: irrigationForm.fieldId,
        amount: parseFloat(irrigationForm.amount),
        duration: parseFloat(irrigationForm.duration),
        date: irrigationForm.date,
        createdAt: new Date().toISOString()
      });
      setIrrigationForm({ fieldId: '', amount: '', duration: '', date: new Date().toISOString().split('T')[0] });
      toast.success("Sulama kaydı eklendi!");
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'irrigationLogs');
    }
  };

  const handleCreateRotationPlan = async (fieldName: string, history: { year: number; crop: string }[]) => {
    if (!user) return;
    const toastId = toast.loading("AI plan oluşturuyor...");
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: `Tarla: ${fieldName}. Geçmiş: ${JSON.stringify(history)}. 
        Bu tarla için toprak sağlığını koruyacak ve verimi artıracak bir sonraki yıl ekim tavsiyesi ver. 
        Kısa ve bilimsel bir açıklama yap.`
      });

      await addDoc(collection(db, 'rotationPlans'), {
        userId: user.uid,
        fieldName,
        history,
        recommendation: response.text,
        createdAt: new Date().toISOString()
      });
      toast.success("Plan oluşturuldu!", { id: toastId });
    } catch (err) {
      toast.error("Plan oluşturulamadı.", { id: toastId });
    }
  };

  const handleUpdateBookingStatus = async (id: string, status: EquipmentBooking['status']) => {
    try {
      await updateDoc(doc(db, 'equipmentBookings', id), { status });
      toast.success(`Rezervasyon ${status === 'confirmed' ? 'onaylandı' : 'güncellendi'}.`);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'equipmentBookings');
    }
  };

  const handleGenerateIrrigationPlan = async () => {
    if (!user || !newPlanInput.cropType) return;
    setIsGeneratingPlan(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: `${newPlanInput.cropType} ürünü için ${newPlanInput.fieldSize} dönüm ${newPlanInput.soilType} toprakta haftalık sulama planı oluştur. Hava durumu: ${weather?.temp}°C, ${weather?.condition}.`
      });

      const planText = response.text || "Plan oluşturulamadı.";
      await addDoc(collection(db, 'irrigationPlans'), {
        ...newPlanInput,
        plan: planText,
        userId: user.uid,
        createdAt: new Date().toISOString()
      });
      toast.success("Sulama planı oluşturuldu!");
    } catch (error) {
      console.error("Irrigation plan error:", error);
      toast.error("Plan oluşturulurken bir hata oluştu.");
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const months = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  const translations = {
    tr: {
      home: 'Ana Sayfa',
      about: 'Hakkımızda',
      blog: 'Blog',
      prices: 'Fiyatlar',
      gallery: 'Galeri',
      community: 'Topluluk',
      admin: 'Yönetim',
      contact: 'İletişim',
      equipment: 'Ekipman & İş Gücü',
      reviews: 'Müşteri Yorumları',
      planner: 'Akıllı Planlayıcı',
      journal: 'Çiftçi Günlüğü',
      heroTitle: 'Sefilli.com',
      heroSubtitle: 'Niğde\'nin bereketli topraklarından sofranıza.',
      heroCta: 'Tarlayı Gez'
    },
    en: {
      home: 'Home',
      about: 'About',
      blog: 'Blog',
      prices: 'Prices',
      gallery: 'Gallery',
      community: 'Community',
      admin: 'Admin',
      contact: 'Contact',
      equipment: 'Equipment & Labor',
      reviews: 'Reviews',
      planner: 'Smart Planner',
      journal: 'Farmer Journal',
      heroTitle: 'Sefilli.com',
      heroSubtitle: 'From the fertile lands of Niğde to your table.',
      heroCta: 'Explore Farm'
    },
    de: {
      home: 'Startseite',
      about: 'Über uns',
      blog: 'Blog',
      prices: 'Preise',
      gallery: 'Galerie',
      community: 'Community',
      admin: 'Admin',
      contact: 'Kontakt',
      equipment: 'Ausrüstung & Arbeit',
      reviews: 'Bewertungen',
      planner: 'Smarter Planer',
      journal: 'Tagebuch',
      heroTitle: 'Sefilli.com',
      heroSubtitle: 'Von den fruchtbaren Böden von Niğde auf Ihren Tisch.',
      heroCta: 'Hof erkunden'
    }
  };

  const navLinks = [
    { id: 'anasayfa', label: translations[language].home },
    { id: 'hakkimizda', label: translations[language].about },
    { id: 'pazar', label: 'Pazar' },
    { id: 'takvim', label: 'Takvim' },
    { id: 'gunluk', label: translations[language].journal },
    { id: 'blog', label: translations[language].blog },
    { id: 'fiyatlar', label: translations[language].prices },
    { id: 'ekipman', label: translations[language].equipment },
    { id: 'yorumlar', label: translations[language].reviews },
    { id: 'planlayici', label: translations[language].planner },
    { id: 'galeri', label: translations[language].gallery },
    { id: 'topluluk', label: translations[language].community },
    { id: 'hasat-tahmini', label: 'Hasat Tahmini' },
    { id: 'ciftci-araclari', label: 'Çiftçi Araçları' },
    { id: 'yonetim', label: translations[language].admin },
    { id: 'iletisim', label: translations[language].contact },
  ];

  console.log("Rendering JSX, navLinks count:", navLinks.length);
  return (
    <div className="min-h-screen flex flex-col bg-farm-cream dark:bg-zinc-950 transition-colors duration-300">
      <Toaster position="top-center" richColors />
      {/* Header */}
      <Header 
        user={user}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        language={language}
        setLanguage={setLanguage}
        weatherAlerts={weatherAlerts}
        setWeatherAlerts={setWeatherAlerts}
        scrollToSection={scrollToSection}
        navLinks={navLinks}
        setShowProfileSettings={setShowProfileSettings}
        setEditingProfile={setEditingProfile}
        currentUserProfile={currentUserProfile}
      />

      {/* Feed Modal */}
      <AnimatePresence>
        {showFeedModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFeedModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-[40px] shadow-2xl overflow-hidden p-8"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl serif text-farm-olive dark:text-farm-cream">Yeni Paylaşım Yap</h3>
                <button onClick={() => setShowFeedModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-all">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={async (e) => {
                e.preventDefault();
                if (!user || !feedForm.content) return;
                try {
                  await handleAddFeedPost(e);
                  setShowFeedModal(false);
                } catch (err) {
                  console.error("Feed post error:", err);
                }
              }} className="space-y-6">
                <textarea 
                  value={feedForm.content}
                  onChange={(e) => setFeedForm({ ...feedForm, content: e.target.value })}
                  placeholder="Neler oluyor? Bir güncelleme paylaş..."
                  className="w-full bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-white/5 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-farm-olive min-h-[120px] resize-none text-sm"
                  required
                />

                <div className="space-y-4">
                  <label className="flex items-center justify-center p-4 bg-gray-50 dark:bg-zinc-800/80 border-2 border-dashed border-gray-100 dark:border-white/5 rounded-2xl cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all">
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = await handleFileUpload(file, 'feed');
                          setFeedForm({ ...feedForm, imageUrl: url });
                        }
                      }}
                    />
                    {feedForm.imageUrl ? (
                      <div className="relative w-full aspect-video rounded-xl overflow-hidden">
                        <img src={feedForm.imageUrl} alt="Önizleme" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-all text-white text-xs font-bold">Resmi Değiştir</div>
                      </div>
                    ) : (
                      <div className="text-gray-400 flex items-center gap-2">
                        <Camera size={20} />
                        <span className="text-sm font-medium">Fotoğraf Ekle</span>
                      </div>
                    )}
                  </label>

                  <button 
                    type="submit" 
                    disabled={isUploading}
                    className="w-full bg-farm-olive text-white py-4 rounded-2xl font-bold shadow-lg shadow-farm-olive/20 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {isUploading ? 'Yükleniyor...' : 'Paylaş'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Profile Settings Modal */}
      <AnimatePresence>
        {showProfileSettings && editingProfile && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowProfileSettings(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-[40px] shadow-2xl overflow-hidden p-8"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl serif text-farm-olive dark:text-farm-cream">Profil Ayarları</h3>
                <button onClick={() => setShowProfileSettings(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-all">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="flex flex-col items-center gap-4 mb-6">
                  <div className="relative group">
                    <img 
                      src={editingProfile.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${editingProfile.displayName}`} 
                      alt="Profil" 
                      className="w-24 h-24 rounded-full object-cover border-4 border-farm-olive/20"
                    />
                    <input 
                      type="file" 
                      id="profile-photo-upload" 
                      className="hidden" 
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const url = await handleFileUpload(file, 'profiles');
                            setEditingProfile({ ...editingProfile, photoUrl: url });
                            toast.success("Profil fotoğrafı yüklendi!");
                          } catch (err) {
                            console.error("Profile photo upload failed:", err);
                          }
                        }
                      }}
                    />
                    <label 
                      htmlFor="profile-photo-upload" 
                      className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-all"
                    >
                      <Camera size={24} />
                    </label>
                  </div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest">Fotoğrafı Değiştir</p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Görünen Ad</label>
                  <input 
                    type="text" 
                    value={editingProfile.displayName}
                    onChange={(e) => setEditingProfile({ ...editingProfile, displayName: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-farm-olive"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Rol</label>
                  <select 
                    value={editingProfile.role}
                    onChange={(e) => setEditingProfile({ ...editingProfile, role: e.target.value as any })}
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-farm-olive"
                  >
                    <option value="farmer">Çiftçi</option>
                    <option value="trader">Tüccar</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Şehir</label>
                  <input 
                    type="text" 
                    value={editingProfile.locationName || ''}
                    onChange={(e) => setEditingProfile({ ...editingProfile, locationName: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-farm-olive"
                    placeholder="Örn: Niğde, Bor"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Hakkımda</label>
                  <textarea 
                    value={editingProfile.bio || ''}
                    onChange={(e) => setEditingProfile({ ...editingProfile, bio: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-farm-olive min-h-[100px]"
                    placeholder="Kendinizden bahsedin..."
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isUploading}
                  className="w-full bg-farm-olive text-white py-4 rounded-2xl font-bold shadow-lg shadow-farm-olive/20 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100"
                >
                  {isUploading ? 'Yükleniyor...' : 'Kaydet'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Profile Modal */}
      <AnimatePresence>
        {selectedProfile && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProfile(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="relative h-48 bg-farm-olive">
                <div className="absolute -bottom-12 left-8 w-24 h-24 rounded-3xl bg-white dark:bg-zinc-800 p-1 shadow-xl">
                  <img 
                    src={selectedProfile.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedProfile.userId}`} 
                    alt={selectedProfile.displayName} 
                    className="w-full h-full object-cover rounded-2xl"
                  />
                </div>
                <button 
                  onClick={() => setSelectedProfile(null)}
                  className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-all"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="pt-16 px-8 pb-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-3xl serif text-farm-olive dark:text-farm-cream">{selectedProfile.displayName}</h3>
                    <p className="text-gray-500 dark:text-zinc-400 flex items-center gap-1">
                      <MapPin size={14} /> {selectedProfile.locationName || 'Niğde'}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-yellow-500 font-bold text-xl">
                      <Star size={20} fill="currentColor" /> {selectedProfile.reliabilityScore.toFixed(1)}
                    </div>
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Güven Skoru</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="bg-farm-olive/5 dark:bg-white/5 p-4 rounded-2xl text-center">
                    <div className="text-xl font-bold text-farm-olive dark:text-farm-cream">{selectedProfile.totalSales}</div>
                    <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Satış</div>
                  </div>
                  <div className="bg-farm-olive/5 dark:bg-white/5 p-4 rounded-2xl text-center">
                    <div className="text-xl font-bold text-farm-olive dark:text-farm-cream">{selectedProfile.role === 'farmer' ? 'Çiftçi' : 'Tüccar'}</div>
                    <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Rol</div>
                  </div>
                  <div className="bg-farm-olive/5 dark:bg-white/5 p-4 rounded-2xl text-center">
                    <div className="text-xl font-bold text-farm-olive dark:text-farm-cream">
                      {new Date(selectedProfile.createdAt).getFullYear()}
                    </div>
                    <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Katılım</div>
                  </div>
                </div>

                <div className="mb-8">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Hakkında</h4>
                  <p className="text-gray-600 dark:text-zinc-400 leading-relaxed italic">
                    {selectedProfile.bio || "Bu kullanıcı henüz bir biyografi eklememiş."}
                  </p>
                </div>

                <div className="mb-8">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Müşteri Yorumları</h4>
                  <div className="space-y-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                    {customerReviews.filter(r => r.targetUserId === selectedProfile.userId).length > 0 ? (
                      customerReviews.filter(r => r.targetUserId === selectedProfile.userId).map(review => (
                        <div key={review.id} className="bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-farm-olive/5">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-farm-olive/10 flex items-center justify-center text-[10px] font-bold text-farm-olive overflow-hidden">
                                {review.userPhoto ? <img src={review.userPhoto} alt="" className="w-full h-full object-cover" /> : review.userName.charAt(0)}
                              </div>
                              <span className="text-xs font-bold text-gray-700 dark:text-zinc-300">{review.userName}</span>
                            </div>
                            <div className="flex text-yellow-400">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} size={10} fill={i < review.rating ? "currentColor" : "none"} />
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-zinc-400 italic leading-relaxed">"{review.comment}"</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400 italic text-center py-4">Henüz yorum yapılmamış.</p>
                    )}
                  </div>
                </div>

                {user && user.uid !== selectedProfile.userId && (
                  <div className="mb-8 p-4 bg-farm-olive/5 rounded-2xl border border-farm-olive/10">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-farm-olive mb-3">Yorum Bırak</h4>
                    <form onSubmit={(e) => handleAddReview(e, selectedProfile.userId)} className="space-y-3">
                      <div className="flex gap-2 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                            className={cn(
                              "transition-all",
                              newReview.rating >= star ? "text-yellow-400" : "text-gray-300"
                            )}
                          >
                            <Star size={18} fill={newReview.rating >= star ? "currentColor" : "none"} />
                          </button>
                        ))}
                      </div>
                      <textarea
                        placeholder="Deneyiminizi paylaşın..."
                        className="w-full p-3 text-sm rounded-xl bg-white dark:bg-zinc-900 border-none focus:ring-1 focus:ring-farm-olive resize-none h-20"
                        value={newReview.comment}
                        onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                        required
                      />
                      <button 
                        type="submit"
                        className="w-full bg-farm-olive text-white py-2 rounded-xl text-xs font-bold hover:bg-farm-olive/90 transition-all"
                      >
                        Yorumu Gönder
                      </button>
                    </form>
                  </div>
                )}

                <div className="flex gap-4">
                  <button className="flex-1 bg-farm-olive text-white py-4 rounded-2xl font-bold hover:bg-farm-olive/90 transition-all shadow-lg shadow-farm-olive/20">
                    İletişime Geç
                  </button>
                  <button className="flex-1 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 py-4 rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all">
                    İlanlarını Gör
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <main className="flex-grow">
        {/* Regional Disease Alerts */}
        <AnimatePresence>
          {diseaseAlerts.length > 0 && (
            <section className="bg-red-50 dark:bg-red-950/20 border-b border-red-100 dark:border-red-900/30 py-4 overflow-hidden">
              <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center gap-4">
                  <div className="bg-red-500 text-white p-2 rounded-xl animate-pulse">
                    <AlertTriangle size={20} />
                  </div>
                  <div className="flex-grow overflow-hidden">
                    <div className="flex items-center gap-8 animate-marquee whitespace-nowrap">
                      {diseaseAlerts.map(alert => (
                        <div key={alert.id} className="flex items-center gap-2 text-red-700 dark:text-red-400 font-bold text-sm uppercase tracking-wider">
                          <span className="bg-red-500 text-white px-2 py-0.5 rounded text-[10px]">{alert.severity}</span>
                          <span>{alert.location}: {alert.cropType} - {alert.diseaseName}</span>
                          <span className="text-red-300 dark:text-red-800">|</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button 
                    onClick={() => scrollToSection('map')}
                    className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline shrink-0"
                  >
                    Detayları Gör
                  </button>
                </div>
              </div>
            </section>
          )}
        </AnimatePresence>

        {/* Hero Section */}
        <section id="anasayfa" className="relative h-[80vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://picsum.photos/seed/farm/1280/720" 
              alt="Farm Hero" 
              className="w-full h-full object-cover brightness-50"
              referrerPolicy="no-referrer"
              loading="lazy"
            />
          </div>
          <div className="relative z-10 text-center px-4 max-w-4xl">
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-6xl md:text-8xl serif text-white mb-6 leading-tight tracking-tight"
            >
              {translations[language].heroTitle}
            </motion.h1>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto font-light tracking-wide"
            >
              {translations[language].heroSubtitle}
            </motion.p>
            <div className="flex flex-wrap justify-center gap-4">
              <button 
                onClick={() => scrollToSection('pazar')}
                className="bg-farm-olive text-white px-8 py-3 rounded-full font-medium hover:bg-farm-olive/90 transition-all"
              >
                {translations[language].heroCta}
              </button>
              <button 
                onClick={() => scrollToSection('fiyatlar')}
                className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-3 rounded-full font-medium hover:bg-white/20 transition-all"
              >
                Fiyatları İncele
              </button>
            </div>
          </div>
          
          {/* Weather Widget Floating */}
          {weather && (
            <div className="absolute bottom-8 right-8 bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-3xl text-white hidden md:flex flex-col gap-4 max-w-xs shadow-2xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Sun className="text-yellow-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{weather.temp}°C</div>
                  <div className="text-sm opacity-80">{weather.city} - {weather.condition}</div>
                </div>
              </div>
              {aiWeatherAdvice && (
                <div className="bg-white/10 p-3 rounded-xl text-xs font-light italic border border-white/10 group">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-grow">
                      <Sparkles size={12} className="inline mr-1 text-yellow-300" />
                      {aiWeatherAdvice}
                    </div>
                    <button 
                      onClick={() => handleTextToSpeech(aiWeatherAdvice)}
                      className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      title="Sesli Dinle"
                    >
                      <Bot size={12} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* News & Announcements */}
        <section className="py-12 bg-farm-cream/50 dark:bg-zinc-950/50 border-y border-farm-olive/5 dark:border-white/5">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="bg-farm-olive/10 p-3 rounded-xl text-farm-olive">
                  <Newspaper size={24} />
                </div>
                <h3 className="text-2xl serif text-farm-olive dark:text-farm-cream">Haberler & Duyurular</h3>
              </div>
              <button className="text-xs font-bold uppercase tracking-widest text-farm-olive hover:underline">Tümünü Gör</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {news.length > 0 ? news.map(item => (
                <motion.div 
                  key={item.id}
                  whileHover={{ y: -5 }}
                  className="bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-sm border border-farm-olive/5 flex flex-col gap-4"
                >
                  <div className="flex items-center justify-between">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                      item.category === 'policy' ? "bg-blue-100 text-blue-600" :
                      item.category === 'weather' ? "bg-orange-100 text-orange-600" :
                      item.category === 'market' ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-600"
                    )}>
                      {item.category === 'policy' ? 'Politika' : 
                       item.category === 'weather' ? 'Hava Durumu' : 
                       item.category === 'market' ? 'Piyasa' : 'Genel'}
                    </span>
                    <span className="text-[10px] text-gray-400 font-bold">{new Date(item.createdAt).toLocaleDateString('tr-TR')}</span>
                  </div>
                  <h4 className="text-lg font-bold text-farm-olive dark:text-farm-cream line-clamp-2 leading-tight">{item.title}</h4>
                  <p className="text-sm text-gray-500 dark:text-zinc-400 line-clamp-3 font-light">{item.content}</p>
                  <button className="mt-auto text-xs font-bold text-farm-olive hover:underline flex items-center gap-1">
                    Devamını Oku <ChevronRight size={14} />
                  </button>
                </motion.div>
              )) : (
                <div className="col-span-3 text-center py-12 text-gray-400 italic">Henüz bir duyuru bulunmuyor.</div>
              )}
            </div>
          </div>
        </section>

        {/* Hakkımızda */}
        <section id="hakkimizda" className="py-24 bg-white dark:bg-zinc-900 transition-colors">
          <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-5xl serif text-farm-olive dark:text-farm-cream mb-8 italic leading-tight">Toprakla Gelen Bereket</h2>
              <div className="space-y-6 text-lg text-gray-600 dark:text-zinc-400 leading-relaxed font-light">
                <p>
                  Niğde'nin verimli topraklarında, İçmeli Köyü'nde nesillerdir çiftçilik yapıyoruz. Bizim için her tohum bir umut, her hasat bir bayramdır.
                </p>
                <p>
                  Ağırlıklı olarak patates üretimi yaparken, yan ürün olarak buğday, arpa ve fasulye ile ürün çeşitliliğimizi koruyoruz. Modern tarım tekniklerini, atalarımızdan kalan tecrübe ile harmanlıyoruz.
                </p>
              </div>
              
              <div className="mt-12 grid grid-cols-2 gap-8">
                <div>
                  <div className="text-4xl font-bold text-farm-olive dark:text-farm-cream mb-2">500+</div>
                  <div className="text-xs uppercase tracking-widest text-gray-400 dark:text-zinc-500 font-bold">Dönüm Arazi</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-farm-olive dark:text-farm-cream mb-2">4</div>
                  <div className="text-xs uppercase tracking-widest text-gray-400 dark:text-zinc-500 font-bold">Ana Mahsül</div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <img src="https://picsum.photos/seed/farmer1/400/600" alt="Farmer" className="rounded-2xl shadow-lg" referrerPolicy="no-referrer" loading="lazy" />
              <div className="flex flex-col gap-4 mt-8">
                <img src="https://picsum.photos/seed/harvest/400/300" alt="Harvest" className="rounded-2xl shadow-lg" referrerPolicy="no-referrer" loading="lazy" />
                <img src="https://picsum.photos/seed/tractor/400/300" alt="Tractor" className="rounded-2xl shadow-lg" referrerPolicy="no-referrer" loading="lazy" />
              </div>
            </div>
          </div>
        </section>

        <section id="pazar" className="py-24 bg-white dark:bg-zinc-900">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-5xl serif text-farm-olive dark:text-farm-cream mb-4 italic">Çiftlik Pazarı</h2>
              <p className="text-gray-500 dark:text-zinc-400">Tarlamızdan taze taze sofranıza. Aracı yok, ton bazında doğrudan satış.</p>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-4">
              <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input 
                    type="text" 
                    placeholder="Ürün veya tüccar ara..." 
                    className="w-full pl-12 pr-4 py-3 rounded-2xl bg-gray-100 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-farm-olive transition-all"
                    value={marketplaceSearch}
                    onChange={(e) => setMarketplaceSearch(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition((pos) => {
                          setLocationFilter({ lat: pos.coords.latitude, lng: pos.coords.longitude, radius: 50 });
                          setIsLocationFilterActive(true);
                          toast.success("Yakınınızdaki ürünler filtrelendi (50km)");
                        }, () => {
                          toast.error("Konum izni alınamadı.");
                        });
                      }
                    }}
                    className={cn(
                      "flex items-center gap-2 px-6 py-3 rounded-2xl font-medium transition-all",
                      isLocationFilterActive ? "bg-farm-olive text-white" : "bg-gray-100 dark:bg-zinc-800 text-gray-500 hover:bg-gray-200"
                    )}
                  >
                    <MapPin size={18} />
                    <span className="hidden sm:inline">{isLocationFilterActive ? "Yakınımda (Aktif)" : "Yakınımda Ara"}</span>
                  </button>
                  {isLocationFilterActive && (
                    <button 
                      onClick={() => {
                        setLocationFilter(null);
                        setIsLocationFilterActive(false);
                      }}
                      className="p-3 bg-red-100 text-red-600 rounded-2xl hover:bg-red-200 transition-all"
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto no-scrollbar pb-2">
                <div className="flex bg-gray-100 dark:bg-zinc-800 p-1 rounded-2xl shrink-0">
                  <button 
                    onClick={() => setMarketplaceViewMode('list')}
                    className={cn(
                      "p-2 rounded-xl transition-all",
                      marketplaceViewMode === 'list' ? "bg-white dark:bg-zinc-700 text-farm-olive shadow-sm" : "text-gray-400"
                    )}
                  >
                    <LayoutGrid size={20} />
                  </button>
                  <button 
                    onClick={() => setMarketplaceViewMode('map')}
                    className={cn(
                      "p-2 rounded-xl transition-all",
                      marketplaceViewMode === 'map' ? "bg-white dark:bg-zinc-700 text-farm-olive shadow-sm" : "text-gray-400"
                    )}
                  >
                    <MapIcon size={20} />
                  </button>
                </div>

                <div className="h-8 w-[1px] bg-gray-200 dark:bg-zinc-700 mx-2 shrink-0"></div>

                <div className="flex gap-2 shrink-0">
                  {['hepsi', 'sebze', 'meyve', 'bakliyat', 'diger'].map(cat => (
                    <button 
                      key={cat}
                      onClick={() => setMarketplaceFilter(cat)}
                      className={cn(
                        "px-6 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap",
                        marketplaceFilter === cat 
                          ? "bg-farm-olive text-white shadow-lg shadow-farm-olive/20" 
                          : "bg-gray-100 dark:bg-zinc-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-zinc-700"
                      )}
                    >
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {marketplaceViewMode === 'list' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {marketplaceItems
                .filter(item => {
                  const matchesSearch = item.name.toLowerCase().includes(marketplaceSearch.toLowerCase()) || 
                                      item.userName.toLowerCase().includes(marketplaceSearch.toLowerCase());
                  const matchesFilter = marketplaceFilter === 'hepsi' || item.category === marketplaceFilter;
                  const matchesLocation = !locationFilter || (item.latitude && item.longitude && calculateDistance(locationFilter.lat, locationFilter.lng, item.latitude, item.longitude) <= locationFilter.radius);
                  return matchesSearch && matchesFilter && matchesLocation;
                })
                .length > 0 ? marketplaceItems
                .filter(item => {
                  const matchesSearch = item.name.toLowerCase().includes(marketplaceSearch.toLowerCase()) || 
                                      item.userName.toLowerCase().includes(marketplaceSearch.toLowerCase());
                  const matchesFilter = marketplaceFilter === 'hepsi' || item.category === marketplaceFilter;
                  const matchesLocation = !locationFilter || (item.latitude && item.longitude && calculateDistance(locationFilter.lat, locationFilter.lng, item.latitude, item.longitude) <= locationFilter.radius);
                  return matchesSearch && matchesFilter && matchesLocation;
                })
                .map(item => (
                <motion.div 
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -10 }}
                  className="bg-farm-cream dark:bg-zinc-800 rounded-[32px] overflow-hidden border border-farm-olive/5 shadow-sm group"
                >
                  <div className="relative h-64 overflow-hidden">
                    <img 
                      src={item.imageUrl || `https://picsum.photos/seed/${item.name}/400/400`} 
                      alt={item.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-farm-olive uppercase tracking-widest">
                      {item.category}
                    </div>
                  </div>
                  <div className="p-6">
                    <div 
                      className="flex items-center gap-2 mb-3 cursor-pointer hover:bg-farm-olive/5 p-2 rounded-xl transition-all"
                      onClick={() => {
                        const profile = userProfiles.find(p => p.userId === item.userId);
                        if (profile) setSelectedProfile(profile);
                        else toast.info("Bu kullanıcının detaylı profili henüz oluşturulmamış.");
                      }}
                    >
                      <div className="w-8 h-8 rounded-full bg-farm-olive/10 flex items-center justify-center text-xs font-bold text-farm-olive overflow-hidden">
                        {item.userId && userProfiles.find(p => p.userId === item.userId)?.photoUrl ? (
                          <img src={userProfiles.find(p => p.userId === item.userId)?.photoUrl} alt="" className="w-full h-full object-cover" />
                        ) : item.userName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-farm-olive dark:text-farm-cream">{item.userName}</p>
                        <p className="text-[10px] text-gray-400">
                          {userProfiles.find(p => p.userId === item.userId)?.role === 'farmer' ? 'Üretici' : 'Tüccar'} • {userProfiles.find(p => p.userId === item.userId)?.reliabilityScore.toFixed(1) || '5.0'} ⭐
                        </p>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-farm-olive dark:text-farm-cream mb-2">{item.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-zinc-400 mb-4 line-clamp-2">{item.description}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-farm-olive dark:text-farm-cream">{item.price}₺</span>
                        <span className="text-xs text-gray-400 ml-1">/{item.unit}</span>
                      </div>
                      <div className="flex gap-2">
                        {item.contactPhone && (
                          <a 
                            href={`tel:${item.contactPhone}`}
                            className="bg-farm-olive text-white p-3 rounded-2xl hover:bg-farm-olive/90 transition-all shadow-md"
                            title="Ara"
                          >
                            <Phone size={20} />
                          </a>
                        )}
                        {item.contactPhone && (
                          <a 
                            href={`https://wa.me/${item.contactPhone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-green-600 text-white p-3 rounded-2xl hover:bg-green-700 transition-all shadow-md"
                            title="WhatsApp"
                          >
                            <MessageCircle size={20} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )) : (
                <div className="col-span-full text-center py-24">
                  <div className="bg-gray-100 dark:bg-zinc-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search size={32} className="text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-zinc-200 mb-2">Ürün Bulunamadı</h3>
                  <p className="text-gray-500 dark:text-zinc-500">Arama kriterlerinize uygun ürün bulunamadı. Lütfen farklı bir arama yapın.</p>
                </div>
              )}
            </div>
            ) : (
              <div className="bg-gray-100 dark:bg-zinc-800 rounded-[40px] h-[600px] relative overflow-hidden flex items-center justify-center border border-farm-olive/10">
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                  <div className="w-full h-full bg-[radial-gradient(#5A5A40_1px,transparent_1px)] [background-size:40px_40px]"></div>
                </div>
                <div className="text-center relative z-10 p-8">
                  <div className="bg-farm-olive/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-farm-olive">
                    <MapIcon size={48} />
                  </div>
                  <h3 className="text-2xl font-bold text-farm-olive dark:text-farm-cream mb-4">İnteraktif Bölge Haritası</h3>
                  <p className="text-gray-500 dark:text-zinc-400 max-w-md mx-auto mb-8">
                    Niğde ve çevre illerdeki ilan yoğunluğunu harita üzerinden takip edin. Yakınınızdaki üreticilere daha hızlı ulaşın.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                    {[
                      { city: 'Niğde', count: marketplaceItems.length },
                      { city: 'Aksaray', count: Math.floor(marketplaceItems.length * 0.4) },
                      { city: 'Nevşehir', count: Math.floor(marketplaceItems.length * 0.3) },
                      { city: 'Kayseri', count: Math.floor(marketplaceItems.length * 0.2) }
                    ].map(stat => (
                      <div key={stat.city} className="bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow-sm border border-farm-olive/5">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.city}</div>
                        <div className="text-xl font-black text-farm-olive">{stat.count} İlan</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Farmer's Journal Section */}
        <section id="gunluk" className="py-24 bg-white dark:bg-zinc-950">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
              <div className="max-w-2xl">
                <h2 className="text-5xl serif text-farm-olive dark:text-farm-cream mb-6">Çiftçi Günlüğü</h2>
                <p className="text-gray-500 dark:text-zinc-400 leading-relaxed">
                  Tarladaki her anı, her emeği kayıt altına alıyoruz. Geçmiş tecrübelerimiz, gelecekteki bereketimizin anahtarıdır.
                </p>
              </div>
              <div className="flex gap-4">
                <div className="text-right">
                  <div className="text-3xl font-bold text-farm-olive dark:text-farm-cream">{harvestEvents.length}</div>
                  <div className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Toplam Kayıt</div>
                </div>
                <div className="w-px h-12 bg-farm-olive/10 dark:bg-white/10" />
                <div className="text-right">
                  <div className="text-3xl font-bold text-farm-olive dark:text-farm-cream">{cropCycles.length}</div>
                  <div className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Aktif Döngü</div>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-8">
                {harvestEvents.slice(0, 5).map((event, i) => (
                  <motion.div 
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="relative pl-12 pb-12 border-l border-farm-olive/10 dark:border-white/10 last:pb-0"
                  >
                    <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-farm-olive dark:bg-farm-cream border-4 border-white dark:border-zinc-950 shadow-sm" />
                    <div className="bg-farm-cream/30 dark:bg-white/5 p-8 rounded-[32px] border border-farm-olive/5 dark:border-white/5 hover:border-farm-olive/20 transition-all group">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-farm-olive dark:text-farm-cream opacity-60">{months[event.month]} 2026</span>
                          <h3 className="text-xl font-bold text-gray-800 dark:text-zinc-100 mt-1">{event.cropName} {event.action === 'planting' ? 'Ekimi' : 'Hasadı'}</h3>
                        </div>
                        <div className="w-10 h-10 bg-white dark:bg-zinc-800 rounded-xl flex items-center justify-center shadow-sm text-farm-olive dark:text-farm-cream group-hover:scale-110 transition-transform">
                          {event.action === 'planting' ? <SproutIcon size={20} /> : <TrendingUp size={20} />}
                        </div>
                      </div>
                      <p className="text-gray-500 dark:text-zinc-400 text-sm leading-relaxed mb-6">{event.description || 'Bu dönem için detaylı not girilmemiş.'}</p>
                      <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        <span className="flex items-center gap-1"><UserIcon size={12} /> {event.userName}</span>
                        <span className="flex items-center gap-1"><Clock size={12} /> {new Date(event.createdAt).toLocaleDateString('tr-TR')}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="space-y-8">
                <div className="bg-farm-olive text-white p-8 rounded-[40px] shadow-xl relative overflow-hidden group">
                  <div className="absolute top-[-20px] right-[-20px] w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                  <BookOpen size={48} className="mb-6 opacity-20" />
                  <h3 className="text-2xl serif mb-4">Günlük Tutun</h3>
                  <p className="text-white/70 text-sm leading-relaxed mb-8">
                    Tarlanızdaki her gelişmeyi not edin. Hangi gübreyi ne zaman attınız? Hangi tohum daha iyi sonuç verdi? Hepsini kaydedin.
                  </p>
                  <button 
                    onClick={() => {
                      setActiveSection('profil');
                      scrollToSection('profil');
                    }}
                    className="w-full bg-white text-farm-olive py-4 rounded-2xl font-bold hover:bg-farm-cream transition-all"
                  >
                    Yeni Kayıt Ekle
                  </button>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-8 rounded-[40px] border border-farm-olive/10 dark:border-white/5">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">Önemli Hatırlatmalar</h4>
                  <div className="space-y-6">
                    {[
                      { title: 'Gübreleme Zamanı', desc: 'Patates tarlası için azotlu gübreleme yaklaşıyor.', date: '15 Nisan' },
                      { title: 'Sulama Kontrolü', desc: 'Hava sıcaklığı artıyor, sulama sistemini kontrol et.', date: 'Yarın' },
                      { title: 'Hasat Hazırlığı', desc: 'Buğdaylar için biçerdöver sırası alınmalı.', date: 'Haziran Sonu' }
                    ].map((note, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="w-1 h-12 bg-farm-olive/20 dark:bg-white/10 rounded-full" />
                        <div>
                          <h5 className="text-sm font-bold text-gray-800 dark:text-zinc-200">{note.title}</h5>
                          <p className="text-xs text-gray-500 dark:text-zinc-500 mt-1">{note.desc}</p>
                          <span className="text-[10px] font-bold text-farm-olive dark:text-farm-cream mt-2 block">{note.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="takvim" className="py-24 bg-farm-cream dark:bg-zinc-950">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
              <div className="max-w-2xl">
                <h2 className="text-5xl serif text-farm-olive dark:text-farm-cream mb-4 italic">Hasat & Ekim Takvimi</h2>
                <p className="text-gray-500 dark:text-zinc-400 text-lg leading-relaxed">
                  Sefilli.com'da yıl boyu süren döngümüz. Hangi ayda ne ekiyoruz, ne zaman hasat ediyoruz? 
                  Doğanın ritmine ayak uyduruyoruz.
                </p>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-farm-olive">
                  <div className="w-3 h-3 bg-farm-olive rounded-full"></div>
                  Ekim
                </div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-orange-500">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  Hasat
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {months.map((month, index) => {
                const events = harvestEvents.filter(e => e.month === index);
                return (
                  <motion.div 
                    key={month}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white dark:bg-zinc-900 p-8 rounded-[40px] shadow-sm border border-farm-olive/5 relative overflow-hidden group"
                  >
                    <div className="absolute top-0 right-0 p-8 text-6xl font-black text-farm-olive/5 dark:text-white/5 select-none group-hover:scale-110 transition-transform">
                      {index + 1 < 10 ? `0${index + 1}` : index + 1}
                    </div>
                    <h3 className="text-2xl font-bold text-farm-olive dark:text-farm-cream mb-6 relative z-10">{month}</h3>
                    <div className="space-y-4 relative z-10">
                      {events.length > 0 ? events.map(event => (
                        <div key={event.id} className="flex items-start gap-3">
                          <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${event.action === 'planting' ? 'bg-farm-olive' : 'bg-orange-500'}`}></div>
                          <div>
                            <p className="text-sm font-bold text-gray-800 dark:text-zinc-200">{event.cropName}</p>
                            <p className="text-xs text-gray-400 dark:text-zinc-500 italic">{event.description}</p>
                          </div>
                        </div>
                      )) : (
                        <p className="text-xs text-gray-300 dark:text-zinc-600 italic">Bu ay için planlanan ana faaliyet bulunmuyor.</p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Farmer's Journal Section */}
        <section id="gunluk" className="py-24 bg-white dark:bg-zinc-900 transition-colors">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
              <div className="max-w-2xl">
                <h2 className="text-5xl serif text-farm-olive dark:text-farm-cream mb-4 italic">Çiftçi Günlüğü</h2>
                <p className="text-gray-500 dark:text-zinc-400 text-lg leading-relaxed">
                  Tarlamızdaki her adımın, her filizin ve her hasadın hikayesi. 
                  Toprakla olan bağımızı kronolojik olarak takip edin.
                </p>
              </div>
              <button 
                onClick={() => setShowProfileSettings(true)}
                className="bg-farm-olive text-white px-8 py-4 rounded-2xl font-bold hover:bg-farm-olive/90 transition-all flex items-center gap-2 shadow-lg hover:shadow-farm-olive/20"
              >
                <Plus size={20} /> Yeni Günlük Girişi
              </button>
            </div>
            
            <FarmerJournal events={harvestEvents} />
          </div>
        </section>

        {/* Blog Section */}
        <section id="blog" className="py-24 bg-farm-cream">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-5xl serif text-farm-olive mb-4">Blog Yazıları</h2>
                <p className="text-gray-500">Tarla günlüğü, bakım notları ve hasat haberleri.</p>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {blogPosts.length > 0 ? blogPosts.map(post => (
                <motion.article 
                  key={post.id}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-3xl overflow-hidden shadow-sm border border-farm-olive/5 relative group"
                >
                  {isAdmin && (
                    <button 
                      onClick={() => handleDelete('blogPosts', post.id)}
                      className="absolute top-4 right-4 z-10 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                  {post.imageUrl && (
                    <img src={post.imageUrl} alt={post.title} className="w-full h-48 object-cover" referrerPolicy="no-referrer" />
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                      <Clock size={14} />
                      <span>{new Date(post.createdAt).toLocaleDateString('tr-TR')}</span>
                      <span>•</span>
                      <span>{post.author}</span>
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-gray-800">{post.title}</h3>
                    <div className="text-gray-600 line-clamp-3 text-sm mb-4">
                      <ReactMarkdown>{post.content}</ReactMarkdown>
                    </div>
                    <button className="text-farm-olive font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                      Devamını Oku <ChevronRight size={16} />
                    </button>
                  </div>
                </motion.article>
              )) : (
                <div className="col-span-3 text-center py-12 text-gray-400 italic">Henüz yazı eklenmemiş.</div>
              )}
            </div>
          </div>
        </section>
        <section id="fiyatlar" className="py-24 bg-white dark:bg-zinc-900 transition-colors">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
              <div className="text-left">
                <h2 className="text-5xl serif text-farm-olive dark:text-farm-cream mb-4 italic">Bölgesel Fiyat Analizi</h2>
                <p className="text-gray-500 dark:text-zinc-400">Güncel piyasa verileri ve bölgesel fiyat değişimleri.</p>
              </div>
              <div className="flex gap-2 bg-gray-100 dark:bg-zinc-800 p-1 rounded-2xl">
                {['Niğde', 'Konya', 'Nevşehir', 'Kayseri'].map(city => (
                  <button
                    key={city}
                    onClick={() => setPriceCity(city)}
                    className={cn(
                      "px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                      priceCity === city ? "bg-farm-olive text-white shadow-md" : "text-gray-400 hover:text-farm-olive"
                    )}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-farm-cream/50 dark:bg-zinc-950/50 rounded-[40px] p-8 shadow-inner border border-farm-olive/5 mb-12">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cropPrices.filter(p => p.city === priceCity).length > 0 ? cropPrices.filter(p => p.city === priceCity).map(price => (
                  <div key={price.id} className="bg-white p-6 rounded-2xl shadow-sm flex flex-col gap-4 relative group">
                    {isAdmin && (
                      <button 
                        onClick={() => handleDelete('cropPrices', price.id)}
                        className="absolute top-4 right-4 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-lg">{price.name}</h3>
                      <div className={cn(
                        "p-2 rounded-lg",
                        price.trend === 'up' ? "bg-green-100 text-green-600" : 
                        price.trend === 'down' ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600"
                      )}>
                        {price.trend === 'up' ? <TrendingUp size={18} /> : 
                         price.trend === 'down' ? <TrendingDown size={18} /> : <Minus size={18} />}
                      </div>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-farm-olive">{price.price}</span>
                      <span className="text-gray-400 text-sm">₺ / {price.unit}</span>
                    </div>
                    
                    {/* Mini Chart */}
                    {price.history && price.history.length > 1 && (
                      <div className="h-20 w-full mt-2">
                        <MiniPriceChart data={price.history} />
                      </div>
                    )}

                    <div className="flex items-center gap-1 text-xs text-gray-400 border-t pt-4">
                      <MapPin size={12} />
                      <span>{price.city}</span>
                      <span className="ml-auto">{new Date(price.updatedAt).toLocaleDateString('tr-TR')}</span>
                    </div>
                  </div>
                )) : (
                  <div className="col-span-full text-center py-12 text-gray-400 italic">Fiyat bilgisi bulunamadı.</div>
                )}
              </div>
            </div>

            {/* Live Market Dashboard */}
            <div className="mb-24">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-farm-olive rounded-2xl flex items-center justify-center text-white shadow-lg">
                  <BarChart3 size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-zinc-100">Canlı Piyasa Paneli</h3>
                  <p className="text-sm text-gray-500">Gerçek zamanlı borsa verileri ve trend analizleri</p>
                </div>
              </div>
              <MarketDashboard cropPrices={cropPrices.filter(p => p.city === priceCity)} />
            </div>

            {/* AI Consultant & Live Stock */}
            <div className="grid lg:grid-cols-2 gap-12 mt-24">
              {/* AI Consultant & Disease Analysis */}
              <div className="space-y-12">
                {/* AI Consultant */}
                <div className="bg-farm-olive text-white p-8 md:p-12 rounded-[40px] shadow-xl relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md">
                        <TrendingUp size={32} />
                      </div>
                      <div>
                        <h3 className="text-3xl serif">Sefilli.com AI Danışman</h3>
                        <p className="text-white/60 text-sm">Çiftlik ve tarım hakkında her şeyi sorun.</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="relative">
                        <input 
                          type="text" 
                          placeholder="Örn: Patates ne zaman ekilir?"
                          value={aiQuery}
                          onChange={(e) => setAiQuery(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleAiConsultant()}
                          className="w-full bg-white/10 border border-white/20 rounded-2xl p-4 pr-16 outline-none focus:ring-2 focus:ring-white transition-all"
                        />
                        <button 
                          onClick={handleAiConsultant}
                          disabled={isAiLoading}
                          className="absolute right-2 top-2 bottom-2 bg-white text-farm-olive px-4 rounded-xl font-bold hover:bg-white/90 transition-all disabled:opacity-50"
                        >
                          {isAiLoading ? "..." : <Send size={20} />}
                        </button>
                      </div>

                      {aiResponse && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 group"
                        >
                          <div className="flex justify-between items-start gap-4 mb-2">
                            <div className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Danışman Yanıtı</div>
                            <button 
                              onClick={() => handleTextToSpeech(aiResponse)}
                              className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all opacity-0 group-hover:opacity-100 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"
                            >
                              <Bot size={14} /> Dinle
                            </button>
                          </div>
                          <div className="leading-relaxed text-sm prose prose-invert max-w-none">
                            <ReactMarkdown>{aiResponse}</ReactMarkdown>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Disease Analysis */}
                <div className="bg-white p-8 md:p-12 rounded-[40px] shadow-sm border border-farm-olive/5">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="bg-farm-olive/10 p-4 rounded-2xl text-farm-olive">
                      <Camera size={32} />
                    </div>
                    <div>
                      <h3 className="text-3xl serif text-farm-olive">Hastalık Teşhisi</h3>
                      <p className="text-gray-500 text-sm">Bitki fotoğrafı yükleyin, AI teşhis etsin.</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-farm-olive/20 rounded-3xl p-8 hover:bg-farm-olive/5 transition-all cursor-pointer relative">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            // Preview
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setDiseaseImage(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                            
                            // Analysis
                            handleDiseaseAnalysis(file);
                          }
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      {diseaseImage ? (
                        <img src={diseaseImage} alt="Preview" className="w-full h-48 object-cover rounded-2xl mb-4" />
                      ) : (
                        <div className="text-center">
                          <Plus className="mx-auto text-farm-olive/40 mb-2" size={32} />
                          <p className="text-sm text-gray-400">Fotoğraf Yükle</p>
                        </div>
                      )}
                    </div>

                    {isAnalyzing && (
                      <div className="flex items-center justify-center gap-2 text-farm-olive font-bold animate-pulse">
                        <Zap size={16} /> Analiz Ediliyor...
                      </div>
                    )}

                    {analysisResult && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-farm-cream p-6 rounded-3xl border border-farm-olive/10"
                      >
                        <h4 className="font-bold text-farm-olive mb-2">Analiz Sonucu:</h4>
                        <div className="text-sm text-gray-600 leading-relaxed prose prose-sm max-w-none">
                          <ReactMarkdown>{analysisResult}</ReactMarkdown>
                        </div>
                      </motion.div>
                    )}

                    {diseaseAnalyses.length > 0 && (
                      <div className="mt-8 pt-8 border-t border-farm-olive/10 dark:border-white/10">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-farm-olive/40 dark:text-zinc-500 mb-4">Geçmiş Analizler</h4>
                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                          {diseaseAnalyses.map(analysis => (
                            <div key={analysis.id} className="bg-farm-cream dark:bg-zinc-800/50 p-3 rounded-2xl flex items-center gap-3 group border border-transparent hover:border-farm-olive/20 transition-all">
                              <img src={analysis.imageUrl} className="w-12 h-12 rounded-xl object-cover" alt="Analysis" />
                              <div className="flex-grow min-w-0">
                                <p className="text-[10px] text-gray-400 dark:text-zinc-500">{new Date(analysis.createdAt).toLocaleDateString('tr-TR')}</p>
                                <p className="text-xs font-bold text-farm-olive dark:text-farm-cream truncate">{analysis.result.substring(0, 50)}...</p>
                              </div>
                              <div className="flex items-center gap-1">
                                <button 
                                  onClick={() => {
                                    setAnalysisResult(analysis.result);
                                    setDiseaseImage(analysis.imageUrl);
                                  }}
                                  className="p-2 text-farm-olive dark:text-farm-cream hover:bg-white dark:hover:bg-zinc-800 rounded-lg transition-all"
                                >
                                  <Eye size={14} />
                                </button>
                                <button 
                                  onClick={() => handleDelete('diseaseAnalysis', analysis.id, analysis.userId)}
                                  className="p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Weather Widget */}
                <div className="bg-white p-8 md:p-12 rounded-[40px] shadow-sm border border-farm-olive/5">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="bg-farm-olive/10 p-4 rounded-2xl text-farm-olive">
                        <CloudSun size={32} />
                      </div>
                      <div>
                        <h3 className="text-3xl serif text-farm-olive">Zirai Hava Durumu</h3>
                        <p className="text-gray-500 text-sm">Niğde, İçmeli Köyü</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-4xl font-bold text-farm-olive">{weather?.temp}°C</span>
                      <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">{weather?.condition}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-farm-cream p-6 rounded-3xl border border-farm-olive/5">
                      <p className="text-[10px] font-bold text-farm-olive/40 uppercase tracking-widest mb-1">Nem</p>
                      <p className="text-xl font-bold text-farm-olive">%{weather?.humidity}</p>
                    </div>
                    <div className="bg-farm-cream p-6 rounded-3xl border border-farm-olive/5">
                      <p className="text-[10px] font-bold text-farm-olive/40 uppercase tracking-widest mb-1">Rüzgar</p>
                      <p className="text-xl font-bold text-farm-olive">{weather?.windSpeed} km/s</p>
                    </div>
                  </div>

                  <div className="mt-8 p-4 bg-yellow-50 border border-yellow-100 rounded-2xl flex items-start gap-3">
                    <AlertTriangle size={18} className="text-yellow-600 mt-1 shrink-0" />
                    <p className="text-xs text-yellow-800 leading-relaxed">
                      <strong>Zirai Uyarı:</strong> Önümüzdeki 48 saat içinde gece don riski bulunmaktadır. Patates ekimleri için önlem alınız.
                    </p>
                  </div>
                </div>
              </div>

              {/* Live Stock & Price History */}
              <div className="space-y-12">
                {/* Live Stock */}
                <div className="bg-farm-cream p-8 md:p-12 rounded-[40px] shadow-sm border border-farm-olive/5">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="bg-farm-olive p-4 rounded-2xl text-white">
                        <ShoppingBag size={32} />
                      </div>
                      <div>
                        <h3 className="text-3xl serif text-farm-olive">Tarlada Ne Var?</h3>
                        <p className="text-gray-500 text-sm">Güncel stok ve fiyatlar.</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {stockItems.map(item => (
                      <div key={item.id} className="bg-white p-6 rounded-3xl border border-farm-olive/5 flex items-center justify-between group hover:border-farm-olive/20 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-farm-cream rounded-xl flex items-center justify-center text-farm-olive font-bold">
                            {item.name[0]}
                          </div>
                          <div>
                            <h4 className="font-bold text-farm-olive">{item.name}</h4>
                            <p className="text-xs text-gray-500">{item.quantity} mevcut</p>
                          </div>
                        </div>
                        <div className="text-right flex items-center gap-4">
                          <div className="flex flex-col items-end">
                            <p className="text-lg font-bold text-farm-olive">{item.price} ₺</p>
                            <p className="text-[10px] text-gray-400 uppercase font-bold">/{item.unit}</p>
                          </div>
                          <a 
                            href={`https://wa.me/905000000000?text=Merhaba, ${item.name} hakkında bilgi almak istiyorum.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-green-500 text-white p-3 rounded-xl hover:bg-green-600 transition-all shadow-lg shadow-green-200"
                          >
                            <MessageCircle size={20} />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price History Chart */}
                <div className="bg-white p-8 md:p-12 rounded-[40px] shadow-sm border border-farm-olive/5">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="bg-farm-olive/10 p-4 rounded-2xl text-farm-olive">
                      <BarChart3 size={32} />
                    </div>
                    <div>
                      <h3 className="text-3xl serif text-farm-olive">Fiyat Analizi</h3>
                      <p className="text-gray-500 text-sm">Niğde borsası geçmiş verileri.</p>
                    </div>
                  </div>

                  <PriceChart data={cropPrices.find(c => c.cropName === selectedCrop)?.history || []} />
                  <div className="mt-4 flex justify-between items-center">
                    <div className="flex gap-2">
                      {['Patates', 'Buğday', 'Arpa', 'Fasulye'].map(crop => (
                        <button 
                          key={crop} 
                          onClick={() => setSelectedCrop(crop)}
                          className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-bold border transition-all",
                            selectedCrop === crop 
                              ? "bg-farm-olive text-white border-farm-olive" 
                              : "border-farm-olive/10 text-farm-olive/60 hover:bg-farm-olive/5"
                          )}
                        >
                          {crop}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Harvest Calendar */}
            <div className="mt-24">
              <div className="text-center mb-12">
                <h2 className="text-5xl serif text-farm-olive mb-4">Hasat & Ekim Takvimi</h2>
                <p className="text-gray-500">Sefilli.com'un yıllık yaşam döngüsü.</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {months.map((month, index) => {
                  const events = harvestEvents.filter(e => e.month === index);
                  return (
                    <div key={month} className="bg-white p-6 rounded-3xl shadow-sm border border-farm-olive/5 flex flex-col min-h-[150px]">
                      <span className="text-xs font-bold text-farm-olive/40 uppercase tracking-widest mb-4">{month}</span>
                      <div className="space-y-2 flex-grow">
                        {events.map(event => (
                          <div key={event.id} className="relative group">
                            {isAdmin && (
                              <button 
                                onClick={() => handleDelete('harvestEvents', event.id)}
                                className="absolute -right-2 -top-2 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 size={10} />
                              </button>
                            )}
                            <div className={cn(
                              "text-[10px] p-2 rounded-lg font-bold",
                              event.action === 'planting' ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600"
                            )}>
                              {event.action === 'planting' ? 'EKİM' : 'HASAT'}: {event.cropName}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
        <section id="tarifler" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-5xl serif text-farm-olive mb-4 leading-tight italic">Tarladan Sofraya</h2>
              <p className="text-gray-500">Çiftliğimizin mahsülleriyle hazırlanan özel tarifler.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recipes.map(recipe => (
                <motion.div 
                  key={recipe.id}
                  whileHover={{ y: -5 }}
                  className="bg-farm-cream rounded-[32px] overflow-hidden shadow-sm border border-farm-olive/5 group"
                >
                  <div className="h-64 overflow-hidden relative">
                    {isAdmin && (
                      <button 
                        onClick={() => handleDelete('recipes', recipe.id)}
                        className="absolute top-4 right-4 z-10 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                    <img src={recipe.imageUrl || "https://picsum.photos/seed/food/600/400"} alt={recipe.title} className="w-full h-full object-cover transition-transform group-hover:scale-110" referrerPolicy="no-referrer" loading="lazy" />
                  </div>
                  <div className="p-8">
                    <h3 className="text-2xl font-bold text-farm-olive mb-4">{recipe.title}</h3>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {recipe.ingredients.map((ing, i) => (
                        <span key={i} className="bg-white px-3 py-1 rounded-full text-[10px] font-bold text-farm-olive/60 uppercase tracking-widest border border-farm-olive/10">
                          {ing}
                        </span>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-3 mb-6">{recipe.instructions}</p>
                    <button className="text-farm-olive font-bold flex items-center gap-2 group-hover:gap-3 transition-all">
                      Tarifi Gör <ChevronRight size={18} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Product Story / Traceability */}
        <section className="py-24 bg-farm-olive text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
            <Zap size={400} className="translate-x-1/2 -translate-y-1/4" />
          </div>
          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-6xl md:text-8xl serif mb-8 leading-tight tracking-tight">ÜRÜNÜN KALİTESİ</h2>
                <p className="text-xl text-white/70 mb-12 font-light leading-relaxed">
                  Sofranıza gelen her patatesin, her buğday tanesinin arkasında büyük bir emek ve titizlik var. Ürünlerimizin kalitesini ve tazeliğini her aşamada kontrol ediyoruz.
                </p>
                <div className="space-y-8">
                  <div className="flex items-start gap-6">
                    <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md">
                      <Clock size={24} />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-2">Şeffaf Üretim</h4>
                      <p className="text-white/50 text-sm">Ekimden hasada kadar tüm süreçler kayıt altında.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-6">
                    <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md">
                      <MapPin size={24} />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-2">Tam İzlenebilirlik</h4>
                      <p className="text-white/50 text-sm">Hangi tarladan, ne zaman toplandığını görün.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="topluluk" className="py-24 bg-farm-cream dark:bg-zinc-950 transition-colors">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
              <div>
                <h2 className="text-5xl serif text-farm-olive dark:text-farm-cream mb-4 leading-tight italic">Çiftçi Dayanışma Forumu</h2>
                <p className="text-gray-500 dark:text-zinc-400">Tecrübe paylaştıkça çoğalır. Sorun, cevaplayalım, yardımlaşalım.</p>
              </div>
              <button 
                onClick={() => user ? setIsForumModalOpen(true) : toast.error("Lütfen önce giriş yapın.")}
                className="bg-farm-olive text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-farm-olive/90 transition-all shadow-lg shadow-farm-olive/20"
              >
                <Plus size={20} /> Yeni Konu Aç
              </button>
            </div>

            {/* Forum Categories */}
            <div className="flex flex-wrap gap-2 mb-12">
              {(['all', 'ekim', 'gubreleme', 'sulama', 'hasat', 'ekipman', 'genel'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setForumCategory(cat)}
                  className={cn(
                    "px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest border transition-all",
                    forumCategory === cat 
                      ? "bg-farm-olive text-white border-farm-olive" 
                      : "bg-white dark:bg-zinc-900 border-farm-olive/10 dark:border-white/5 text-farm-olive/60 dark:text-zinc-500 hover:border-farm-olive"
                  )}
                >
                  {cat === 'all' ? 'TÜMÜ' : cat}
                </button>
              ))}
            </div>

            <div className="grid gap-6">
              {forumPosts
                .filter(p => forumCategory === 'all' || p.category === forumCategory)
                .map(post => (
                  <motion.div 
                    key={post.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-zinc-900 p-8 rounded-[32px] shadow-sm border border-farm-olive/5 dark:border-white/5 group hover:shadow-xl transition-all"
                  >
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-grow">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <span className="bg-farm-olive/10 dark:bg-farm-cream/10 text-farm-olive dark:text-farm-cream px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                              {post.category}
                            </span>
                            <span className="text-xs text-gray-400 dark:text-zinc-500">{new Date(post.createdAt).toLocaleDateString('tr-TR')}</span>
                          </div>
                          {(isAdmin || (user && post.authorId === user.uid)) && (
                            <button 
                              onClick={() => handleDelete('forumPosts', post.id, post.authorId)}
                              className="text-red-400 hover:text-red-600 transition-colors p-2"
                              title="Sil"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                        <h3 className="text-2xl font-bold text-farm-olive dark:text-farm-cream mb-4 group-hover:text-farm-olive/80 transition-colors">{post.title}</h3>
                        <p className="text-gray-600 dark:text-zinc-400 line-clamp-2 mb-6">{post.content}</p>
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-farm-olive/10 rounded-full flex items-center justify-center text-farm-olive font-bold text-xs uppercase">
                              {post.authorName[0]}
                            </div>
                            <span className="text-sm font-bold text-farm-olive dark:text-farm-cream">{post.authorName}</span>
                          </div>
                          <div className="flex items-center gap-4 border-l border-gray-100 dark:border-white/5 pl-6">
                            <button 
                              onClick={() => handleForumLike(post.id, post.likes)}
                              className={cn(
                                "flex items-center gap-2 text-sm font-bold transition-colors",
                                user && post.likes.includes(user.uid) ? "text-red-500" : "text-gray-400 hover:text-red-500"
                              )}
                            >
                              <ThumbsUp size={18} /> {post.likes.length}
                            </button>
                            <div className="flex items-center gap-2 text-sm font-bold text-gray-400">
                              <MessageSquareIcon size={18} /> {post.commentCount}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="md:w-48 flex items-center justify-center border-t md:border-t-0 md:border-l border-gray-100 dark:border-white/5 pt-6 md:pt-0 md:pl-6">
                        <button className="w-full bg-farm-olive/5 dark:bg-white/5 text-farm-olive dark:text-farm-cream py-3 rounded-2xl font-bold text-sm hover:bg-farm-olive hover:text-white transition-all">
                          Tartışmaya Katıl
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
            </div>
          </div>
        </section>



        {/* Farmer Tools Section */}
        <section id="ciftci-araclari" className="py-24 bg-farm-cream dark:bg-zinc-950 transition-colors">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-5xl serif text-farm-olive dark:text-farm-cream mb-4 italic">Çiftçi Araçları</h2>
              <p className="text-gray-500 dark:text-zinc-400 max-w-2xl mx-auto">
                Tarımsal faaliyetlerinizi dijitalleştirin. Finansal takip, akıllı takvim ve AI destekli danışmanlık ile veriminizi artırın.
              </p>
            </div>

            {!user ? (
              <div className="bg-white dark:bg-zinc-900 rounded-[48px] p-16 text-center border border-farm-olive/10 shadow-2xl max-w-3xl mx-auto">
                <div className="w-24 h-24 bg-farm-olive/10 rounded-full flex items-center justify-center text-farm-olive mx-auto mb-8">
                  <LockIcon size={48} />
                </div>
                <h3 className="text-3xl serif text-farm-olive dark:text-farm-cream mb-6">Bu Araçlar Sadece Üyelerimize Özeldir</h3>
                <p className="text-gray-600 dark:text-zinc-400 mb-10 text-lg">
                  Finansal takip, ekim takvimi ve AI danışman gibi gelişmiş özelliklere erişmek için lütfen giriş yapın.
                </p>
                <button 
                  onClick={handleLogin}
                  className="bg-farm-olive text-white px-12 py-4 rounded-full font-bold text-lg flex items-center gap-3 mx-auto hover:bg-farm-olive/90 transition-all shadow-xl shadow-farm-olive/20"
                >
                  <LogIn size={24} /> Google ile Giriş Yap
                </button>
              </div>
            ) : (
              <div className="grid lg:grid-cols-[300px_1fr] gap-12">
                {/* Sidebar Navigation */}
                <div className="space-y-2">
                  {[
                    { id: 'finance', label: 'Finansal Takip', icon: TrendingUp },
                    { id: 'inventory', label: 'Dijital Ambar', icon: Package },
                    { id: 'destek', label: 'Destek Hesapla', icon: Calculator },
                    { id: 'rotation', label: 'Ekim Nöbeti', icon: SproutIcon },
                    { id: 'feed', label: 'Çiftçi Sosyal', icon: Share2 },
                    { id: 'irrigation', label: 'Akıllı Sulama', icon: Droplets },
                    { id: 'rental', label: 'Ekipman Kiralama', icon: Tractor },
                    { id: 'calendar', label: 'Ekim Takvimi', icon: Calendar },
                    { id: 'ai', label: 'AI Danışmanı', icon: Bot },
                    { id: 'map', label: 'Hastalık Haritası', icon: MapPin },
                    { id: 'soil', label: 'Toprak Analizi', icon: FileText },
                    { id: 'hasat', label: 'Hasat Tahmini', icon: Zap },
                    { id: 'don', label: 'Don Uyarısı', icon: AlertTriangle },
                    { id: 'ilaclama', label: 'İlaçlama Rehberi', icon: FlaskConical },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setFarmerToolTab(tab.id as any)}
                      className={cn(
                        "w-full flex items-center gap-4 px-6 py-4 rounded-[22px] font-bold transition-all text-left",
                        farmerToolTab === tab.id 
                          ? "bg-farm-olive text-white shadow-xl shadow-farm-olive/30 scale-102" 
                          : "bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md text-farm-olive/60 dark:text-zinc-500 hover:bg-farm-olive/5 dark:hover:bg-white/5"
                      )}
                    >
                      <tab.icon size={20} className={farmerToolTab === tab.id ? "text-farm-accent" : ""} />
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Content Area */}
                <div className="bg-white dark:bg-zinc-900 rounded-[40px] p-8 md:p-12 shadow-xl border border-farm-olive/5 dark:border-white/5 min-h-[600px]">
                  {farmerToolTab === 'finance' && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                      <FinancialDashboard 
                        expenses={expenses} 
                        incomes={incomes} 
                        onAddIncome={() => {
                          const cropName = prompt("Ürün Adı:");
                          const amount = prompt("Tutar (₺):");
                          const quantity = prompt("Miktar:");
                          if (cropName && amount && quantity) {
                            addDoc(collection(db, 'income'), {
                              userId: user.uid,
                              cropName,
                              amount: parseFloat(amount),
                              quantity: parseFloat(quantity),
                              unit: 'kg',
                              date: new Date().toISOString().split('T')[0],
                              createdAt: new Date().toISOString()
                            });
                          }
                        }}
                      />
                      
                      <div className="border-t border-gray-100 dark:border-gray-800 pt-12">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                          <div>
                            <h3 className="text-2xl serif text-farm-olive dark:text-farm-cream mb-2">Gider Kaydı</h3>
                            <p className="text-gray-500 text-sm">Giderlerinizi detaylı olarak kaydedin.</p>
                          </div>
                        </div>

                        <form onSubmit={handleAddExpense} className="grid md:grid-cols-4 gap-4 p-6 bg-farm-cream dark:bg-zinc-800/50 rounded-3xl border border-farm-olive/10">
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-widest text-farm-olive/40 px-2">Kategori</label>
                          <select 
                            className="w-full bg-white dark:bg-zinc-900 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-farm-olive"
                            value={expenseForm.category}
                            onChange={(e) => setExpenseForm({...expenseForm, category: e.target.value as Expense['category']})}
                          >
                            <option value="yakit">Yakıt</option>
                            <option value="gubre">Gübre</option>
                            <option value="ilac">İlaç</option>
                            <option value="iscilik">İşçilik</option>
                            <option value="tohum">Tohum</option>
                            <option value="diger">Diğer</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-widest text-farm-olive/40 px-2">Miktar (₺)</label>
                          <input 
                            type="number" 
                            placeholder="0.00"
                            className="w-full bg-white dark:bg-zinc-900 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-farm-olive"
                            value={expenseForm.amount}
                            onChange={(e) => setExpenseForm({...expenseForm, amount: e.target.value})}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-widest text-farm-olive/40 px-2">Açıklama</label>
                          <input 
                            type="text" 
                            placeholder="Örn: Traktör mazotu"
                            className="w-full bg-white dark:bg-zinc-900 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-farm-olive"
                            value={expenseForm.description}
                            onChange={(e) => setExpenseForm({...expenseForm, description: e.target.value})}
                            required
                          />
                        </div>
                        <div className="flex items-end">
                          <button type="submit" className="w-full bg-farm-olive text-white py-3 rounded-xl font-bold hover:bg-farm-olive/90 transition-all flex items-center justify-center gap-2">
                            <Plus size={18} /> Ekle
                          </button>
                        </div>
                      </form>

                      <div className="space-y-4">
                        <h4 className="text-sm font-bold uppercase tracking-widest text-farm-olive/40 px-2">Son İşlemler</h4>
                        <div className="overflow-hidden rounded-3xl border border-farm-olive/5">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-farm-olive/5 dark:bg-white/5">
                                <th className="p-4 text-xs font-bold uppercase text-farm-olive/60">Tarih</th>
                                <th className="p-4 text-xs font-bold uppercase text-farm-olive/60">Kategori</th>
                                <th className="p-4 text-xs font-bold uppercase text-farm-olive/60">Açıklama</th>
                                <th className="p-4 text-xs font-bold uppercase text-farm-olive/60 text-right">Tutar</th>
                                <th className="p-4 w-10"></th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-farm-olive/5 dark:divide-white/5">
                              {expenses.length > 0 ? expenses.map(exp => (
                                <tr key={exp.id} className="hover:bg-farm-olive/5 dark:hover:bg-white/5 transition-colors">
                                  <td className="p-4 text-sm text-gray-500">{new Date(exp.date).toLocaleDateString('tr-TR')}</td>
                                  <td className="p-4">
                                    <span className="bg-farm-olive/10 text-farm-olive px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                                      {exp.category}
                                    </span>
                                  </td>
                                  <td className="p-4 text-sm font-medium text-farm-olive dark:text-farm-cream">{exp.description}</td>
                                  <td className="p-4 text-sm font-bold text-right text-farm-olive dark:text-farm-cream">{exp.amount.toLocaleString('tr-TR')} ₺</td>
                                  <td className="p-4">
                                    <button 
                                      onClick={() => handleDelete('expenses', exp.id, exp.userId)}
                                      className="text-red-400 hover:text-red-600 transition-colors"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </td>
                                </tr>
                              )) : (
                                <tr>
                                  <td colSpan={5} className="p-12 text-center text-gray-400 italic">Henüz kayıtlı gider yok.</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                  {farmerToolTab === 'inventory' && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                      <InventoryManager 
                        items={inventoryItems}
                        onUpdate={handleUpdateInventoryQuantity}
                        onDelete={(id) => handleDelete('inventory', id)}
                        onAdd={() => {
                          const name = prompt("Ürün Adı:");
                          const category = prompt("Kategori (gubre, ilac, tohum, mazot):") as any;
                          const quantity = prompt("Miktar:");
                          const minThreshold = prompt("Kritik Stok Seviyesi:");
                          if (name && category && quantity) {
                            addDoc(collection(db, 'inventory'), {
                              userId: user.uid,
                              name,
                              category,
                              quantity: parseFloat(quantity),
                              unit: 'kg',
                              minThreshold: parseFloat(minThreshold || '10'),
                              updatedAt: new Date().toISOString()
                            });
                          }
                        }}
                      />
                    </motion.div>
                  )}

                  {farmerToolTab === 'destek' && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                       <div className="bg-farm-cream dark:bg-zinc-800 p-8 rounded-[40px] border border-farm-olive/10 shadow-inner">
                        <div className="flex items-center gap-4 mb-8">
                          <div className="w-12 h-12 bg-farm-olive/10 rounded-2xl flex items-center justify-center text-farm-olive">
                            <Calculator size={24} />
                          </div>
                          <div>
                            <h3 className="text-2xl serif text-farm-olive dark:text-farm-cream">Mazot & Gübre Desteği Hesaplayıcı</h3>
                            <p className="text-sm text-gray-400">Güncel devlet desteklemelerine göre alacağınız tutarı hesaplayın.</p>
                          </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-8">
                          <div className="space-y-6">
                            <div>
                              <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-2">Ürün Seçimi</label>
                              <select className="w-full bg-white dark:bg-zinc-900 border-none rounded-xl p-4 text-sm outline-none ring-1 ring-farm-olive/10">
                                <option>Patates</option>
                                <option>Buğday</option>
                                <option>Arpa</option>
                                <option>Fasulye</option>
                                <option>Mısır</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-2">Arazi Miktarı (Dönüm)</label>
                              <input type="number" placeholder="Örn: 50" className="w-full bg-white dark:bg-zinc-900 border-none rounded-xl p-4 text-sm outline-none ring-1 ring-farm-olive/10" />
                            </div>
                            <div className="pt-2">
                              <button className="w-full bg-farm-olive text-white py-4 rounded-2xl font-bold shadow-lg shadow-farm-olive/20 hover:scale-[1.02] transition-all">Destek Tutarı Hesapla</button>
                            </div>
                          </div>
                          <div className="bg-white dark:bg-zinc-900 p-8 rounded-[32px] border border-farm-olive/5 flex flex-col justify-center text-center">
                            <p className="text-xs text-gray-400 mb-2 uppercase tracking-widest font-bold">Tahmini Toplam Destek</p>
                            <span className="text-5xl font-bold text-farm-olive dark:text-farm-cream">0,00 ₺</span>
                            <div className="mt-8 space-y-2 text-left">
                              <div className="flex justify-between text-xs text-gray-500">
                                <span>Mazot Desteği:</span>
                                <span>0,00 ₺</span>
                              </div>
                              <div className="flex justify-between text-xs text-gray-500">
                                <span>Gübre Desteği:</span>
                                <span>0,00 ₺</span>
                              </div>
                            </div>
                            <p className="text-[10px] text-gray-400 mt-6 leading-relaxed bg-farm-cream/50 dark:bg-white/5 p-3 rounded-lg">
                              *Bu değerler 2024 yılı ÇKS verileri ve resmi gazete duyuruları baz alınarak simüle edilmiştir. Kesin tutarlar il/ilçe tarım müdürlükleri tarafından belirlenir.
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {farmerToolTab === 'rotation' && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                      <RotationPlanner 
                        plans={rotationPlans}
                        onAdd={() => {
                          const fieldName = prompt("Tarla Adı:");
                          if (fieldName) {
                            handleCreateRotationPlan(fieldName, [
                              { year: 2024, crop: 'Patates' },
                              { year: 2023, crop: 'Buğday' }
                            ]);
                          }
                        }}
                      />
                    </motion.div>
                  )}

                  {farmerToolTab === 'feed' && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                      <FarmerFeed 
                        posts={feedPosts}
                        onLike={handleLikeFeedPost}
                        onComment={(id) => {
                          const comment = prompt("Yorumunuz:");
                          if (comment && user) {
                            addDoc(collection(db, 'feedComments'), {
                              postId: id,
                              userId: user.uid,
                              userName: user.displayName || 'Çiftçi',
                              content: comment,
                              createdAt: new Date().toISOString()
                            });
                          }
                        }}
                        onPost={() => setShowFeedModal(true)}
                      />
                    </motion.div>
                  )}

                  {farmerToolTab === 'irrigation' && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                      <IrrigationDashboard 
                        logs={irrigationLogs}
                        weather={weather}
                        onAdd={() => {
                          const amount = prompt("Su Miktarı (m³):");
                          if (amount) {
                            addDoc(collection(db, 'irrigationLogs'), {
                              userId: user.uid,
                              fieldId: 'Ana Tarla',
                              amount: parseFloat(amount),
                              duration: 2,
                              date: new Date().toISOString().split('T')[0],
                              createdAt: new Date().toISOString()
                            });
                          }
                        }}
                      />

                      <div className="border-t border-farm-olive/10 pt-12">
                        <div className="flex justify-between items-center mb-8">
                          <div>
                            <h3 className="text-2xl serif text-farm-olive dark:text-farm-cream mb-2">Akıllı Sulama Planı</h3>
                            <p className="text-gray-500 text-sm">AI destekli sulama önerileri.</p>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4 bg-farm-cream dark:bg-zinc-800/50 p-6 rounded-3xl border border-farm-olive/10 mb-8">
                          <input 
                            type="text" 
                            placeholder="Ürün (Örn: Patates)"
                            className="bg-white dark:bg-zinc-900 border-none rounded-xl px-4 py-3 text-sm"
                            value={newPlanInput.cropType}
                            onChange={(e) => setNewPlanInput({...newPlanInput, cropType: e.target.value})}
                          />
                          <input 
                            type="number" 
                            placeholder="Alan (Dönüm)"
                            className="bg-white dark:bg-zinc-900 border-none rounded-xl px-4 py-3 text-sm"
                            value={newPlanInput.fieldSize || ''}
                            onChange={(e) => setNewPlanInput({...newPlanInput, fieldSize: Number(e.target.value)})}
                          />
                          <button 
                            onClick={handleGenerateIrrigationPlan}
                            disabled={isGeneratingPlan}
                            className="bg-farm-olive text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                          >
                            {isGeneratingPlan ? <Zap className="animate-spin" /> : <Droplets size={18} />}
                            Plan Oluştur
                          </button>
                        </div>

                        <div className="space-y-6">
                          {irrigationPlans.map(plan => (
                            <div key={plan.id} className="bg-white dark:bg-zinc-800 p-8 rounded-[32px] border border-farm-olive/5">
                              <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500">
                                    <Droplets size={20} />
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-farm-olive dark:text-farm-cream">{plan.cropType} Planı</h4>
                                    <p className="text-xs text-gray-400">{plan.fieldSize} Dönüm • {new Date(plan.createdAt).toLocaleDateString('tr-TR')}</p>
                                  </div>
                                </div>
                                <button onClick={() => handleDelete('irrigationPlans', plan.id)} className="text-red-400"><Trash2 size={18} /></button>
                              </div>
                              <div className="prose prose-sm dark:prose-invert max-w-none bg-farm-cream/30 dark:bg-white/5 p-6 rounded-2xl">
                                <ReactMarkdown>{plan.plan}</ReactMarkdown>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {farmerToolTab === 'rental' && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                      <EquipmentRentalManager 
                        listings={marketplaceItems.filter(i => i.category === 'ekipman') as any}
                        bookings={equipmentBookings}
                        currentUserId={user.uid}
                        onBook={(id) => toast.info("Rezervasyon talebi gönderildi.")}
                        onUpdateStatus={handleUpdateBookingStatus}
                      />
                    </motion.div>
                  )}

                  {farmerToolTab === 'calendar' && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-3xl serif text-farm-olive dark:text-farm-cream mb-2">Ekim & Hasat Takvimi</h3>
                          <p className="text-gray-500 text-sm">Ürünlerinizin yaşam döngüsünü takip edin.</p>
                        </div>
                        <button 
                          onClick={() => setShowCropForm(!showCropForm)}
                          className="bg-farm-olive text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-farm-olive/90 transition-all"
                        >
                          <Plus size={20} /> Yeni Ürün Ekle
                        </button>
                      </div>

                      <AnimatePresence>
                        {showCropForm && (
                          <motion.form 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            onSubmit={handleAddCropCycle}
                            className="grid md:grid-cols-3 gap-6 p-8 bg-farm-cream dark:bg-zinc-800/50 rounded-[32px] border border-farm-olive/10 overflow-hidden"
                          >
                            <div className="space-y-2">
                              <label className="text-xs font-bold uppercase tracking-widest text-farm-olive/40 px-2">Ürün Adı</label>
                              <input 
                                type="text" 
                                placeholder="Örn: Domates, Mısır"
                                className="w-full bg-white dark:bg-zinc-900 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-farm-olive"
                                value={cropForm.cropName}
                                onChange={(e) => setCropForm({...cropForm, cropName: e.target.value})}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-bold uppercase tracking-widest text-farm-olive/40 px-2">Ekim Tarihi</label>
                              <input 
                                type="date" 
                                className="w-full bg-white dark:bg-zinc-900 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-farm-olive"
                                value={cropForm.plantingDate}
                                onChange={(e) => setCropForm({...cropForm, plantingDate: e.target.value})}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-bold uppercase tracking-widest text-farm-olive/40 px-2">Notlar</label>
                              <input 
                                type="text" 
                                placeholder="Örn: Yerli tohum, damlama sulama"
                                className="w-full bg-white dark:bg-zinc-900 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-farm-olive"
                                value={cropForm.notes}
                                onChange={(e) => setCropForm({...cropForm, notes: e.target.value})}
                              />
                            </div>
                            <div className="md:col-span-3 flex justify-end gap-4 mt-4">
                              <button 
                                type="button" 
                                onClick={() => setShowCropForm(false)}
                                className="px-6 py-3 text-farm-olive font-bold hover:bg-farm-olive/5 rounded-xl transition-all"
                              >
                                İptal
                              </button>
                              <button type="submit" className="bg-farm-olive text-white px-10 py-3 rounded-xl font-bold hover:bg-farm-olive/90 transition-all">
                                Kaydet
                              </button>
                            </div>
                          </motion.form>
                        )}
                      </AnimatePresence>

                      <div className="grid md:grid-cols-2 gap-6">
                        {cropCycles.length > 0 ? cropCycles.map(crop => (
                          <div key={crop.id} className="bg-farm-cream/30 dark:bg-zinc-800/30 p-8 rounded-[32px] border border-farm-olive/5 relative group">
                            <button 
                              onClick={() => handleDelete('cropCycles', crop.id, crop.userId)}
                              className="absolute top-6 right-6 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-600"
                            >
                              <Trash2 size={20} />
                            </button>
                            <div className="flex items-center gap-4 mb-6">
                              <div className="w-14 h-14 bg-farm-olive/10 rounded-2xl flex items-center justify-center text-farm-olive">
                                <SproutIcon size={28} />
                              </div>
                              <div>
                                <h4 className="text-xl font-bold text-farm-olive dark:text-farm-cream">{crop.cropName}</h4>
                                <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Aktif Döngü</p>
                              </div>
                            </div>
                            <div className="space-y-4">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Ekim Tarihi:</span>
                                <span className="font-bold text-farm-olive dark:text-farm-cream">{new Date(crop.plantingDate).toLocaleDateString('tr-TR')}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Geçen Süre:</span>
                                <span className="font-bold text-farm-olive dark:text-farm-cream">
                                  {Math.floor((new Date().getTime() - new Date(crop.plantingDate).getTime()) / (1000 * 60 * 60 * 24))} Gün
                                </span>
                              </div>
                              {crop.notes && (
                                <div className="pt-4 mt-4 border-t border-farm-olive/5 text-sm text-gray-600 dark:text-zinc-400 italic">
                                  "{crop.notes}"
                                </div>
                              )}
                            </div>
                          </div>
                        )) : (
                          <div className="md:col-span-2 text-center py-20 text-gray-400 italic border-2 border-dashed border-farm-olive/10 rounded-[40px]">
                            Henüz kayıtlı bir ekim döngüsü yok.
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {farmerToolTab === 'ai' && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="h-full flex flex-col">
                      <div className="mb-8">
                        <h3 className="text-3xl serif text-farm-olive dark:text-farm-cream mb-2">AI Tarım Danışmanı</h3>
                        <p className="text-gray-500 text-sm">Toprak, gübreleme ve hastalıklar hakkında AI'ya danışın.</p>
                      </div>

                      <div className="flex-grow bg-farm-cream/30 dark:bg-zinc-800/30 rounded-[32px] p-6 mb-6 overflow-y-auto max-h-[500px] space-y-4 custom-scrollbar">
                        {chatMessages.length > 0 ? chatMessages.map((msg, idx) => (
                          <div key={idx} className={cn(
                            "flex flex-col max-w-[80%]",
                            msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                          )}>
                            <div className={cn(
                              "p-4 rounded-2xl text-sm leading-relaxed",
                              msg.role === 'user' 
                                ? "bg-farm-olive text-white rounded-tr-none" 
                                : "bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border border-farm-olive/5 dark:border-white/5 rounded-tl-none"
                            )}>
                              <ReactMarkdown>{msg.content}</ReactMarkdown>
                            </div>
                            <span className="text-[10px] text-gray-400 mt-1 px-2">
                              {new Date(msg.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        )) : (
                          <div className="h-full flex items-center justify-center text-center p-12">
                            <div>
                              <Bot size={48} className="text-farm-olive/20 mx-auto mb-4" />
                              <p className="text-gray-400 italic">Merhaba! Ben Sefilli AI. Tarımla ilgili her türlü sorunuzu sorabilirsiniz.</p>
                            </div>
                          </div>
                        )}
                        <div ref={chatEndRef} />
                      </div>

                      <form onSubmit={handleSendChatMessage} className="flex gap-4">
                        <input 
                          type="text" 
                          placeholder="Sorunuzu buraya yazın..."
                          className="flex-grow bg-farm-cream dark:bg-zinc-800 border-none rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-farm-olive"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          disabled={isChatting}
                        />
                        <button 
                          type="submit" 
                          disabled={isChatting || !chatInput.trim()}
                          className="bg-farm-olive text-white p-4 rounded-2xl hover:bg-farm-olive/90 transition-all disabled:opacity-50"
                        >
                          {isChatting ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={24} />}
                        </button>
                      </form>
                    </motion.div>
                  )}

                  {farmerToolTab === 'map' && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                      <div>
                        <h3 className="text-3xl serif text-farm-olive dark:text-farm-cream mb-2">Hastalık Haritası & Teşhis</h3>
                        <p className="text-gray-500 text-sm">Bitkilerinizdeki hastalıkları AI ile teşhis edin ve bölgenizdeki riskleri görün.</p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-farm-cream dark:bg-zinc-800/50 p-8 rounded-[32px] border border-farm-olive/10">
                          <h4 className="font-bold mb-4 flex items-center gap-2 text-farm-olive dark:text-farm-cream">
                            <Camera size={20} /> Yeni Teşhis
                          </h4>
                          <div className="space-y-4">
                            <div className="aspect-video bg-white dark:bg-zinc-900 rounded-2xl border-2 border-dashed border-farm-olive/20 flex items-center justify-center overflow-hidden relative">
                              {diseaseImage ? (
                                <img src={diseaseImage} alt="Hastalık" className="w-full h-full object-cover" />
                              ) : (
                                <div className="text-center p-6">
                                  <ImageIcon size={48} className="mx-auto mb-4 text-farm-olive/20" />
                                  <p className="text-sm text-gray-400">Bitkinin hasta bölgesinin fotoğrafını yükleyin</p>
                                </div>
                              )}
                              <input 
                                type="file" 
                                accept="image/*" 
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    setDiseaseFile(file);
                                    const reader = new FileReader();
                                    reader.onloadend = () => setDiseaseImage(reader.result as string);
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </div>
                            <button 
                              onClick={() => diseaseFile && handleDiseaseAnalysis(diseaseFile)}
                              disabled={!diseaseFile || isAnalyzing}
                              className="w-full bg-farm-olive text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                              {isAnalyzing ? <Zap className="animate-spin" /> : <Sparkles size={20} />}
                              {isAnalyzing ? "Analiz Ediliyor..." : "AI ile Teşhis Koy"}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-6">
                          <h4 className="font-bold text-farm-olive dark:text-farm-cream px-2">Geçmiş Teşhisler</h4>
                          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                            {diseaseAnalyses.map(analysis => (
                              <div key={analysis.id} className="bg-white dark:bg-zinc-800 p-4 rounded-2xl border border-farm-olive/5 flex gap-4">
                                <img src={analysis.imageUrl} alt="Teşhis" className="w-20 h-20 rounded-xl object-cover" />
                                <div className="flex-grow">
                                  <p className="text-[10px] text-gray-400 mb-1">{new Date(analysis.createdAt).toLocaleDateString('tr-TR')}</p>
                                  <p className="text-xs line-clamp-2 text-gray-600 dark:text-zinc-400">{analysis.result}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {farmerToolTab === 'soil' && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                      <div>
                        <h3 className="text-3xl serif text-farm-olive dark:text-farm-cream mb-2">Toprak Analizi Raporları</h3>
                        <p className="text-gray-500 text-sm">Laboratuvar sonuçlarınızı yükleyin, AI sizin için yorumlasın.</p>
                      </div>

                      <form onSubmit={handleSoilAnalysisUpload} className="bg-farm-cream dark:bg-zinc-800/50 p-8 rounded-[32px] border border-farm-olive/10">
                        <div className="space-y-4">
                          <label className="block bg-white dark:bg-zinc-900 border-2 border-dashed border-farm-olive/20 rounded-2xl p-6 text-center cursor-pointer hover:border-farm-olive/40 transition-all">
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/*,application/pdf"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setSoilFile(file);
                                  const url = await handleFileUpload(file, 'soil-analyses');
                                  setNewSoilAnalysis({...newSoilAnalysis, reportUrl: url});
                                }
                              }}
                            />
                            {newSoilAnalysis.reportUrl ? (
                              <div className="text-farm-olive font-bold flex items-center justify-center gap-2">
                                <FileText size={20} /> Rapor Yüklendi ✅
                              </div>
                            ) : (
                              <div className="text-gray-400">
                                <Upload size={32} className="mx-auto mb-2 opacity-20" />
                                <p className="text-sm">Rapor fotoğrafını veya PDF dosyasını buraya yükleyin</p>
                              </div>
                            )}
                          </label>
                          <button 
                            type="submit" 
                            disabled={isAnalyzing || !newSoilAnalysis.reportUrl}
                            className="w-full bg-farm-olive text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            {isAnalyzing ? <Zap className="animate-spin" /> : <FileText size={20} />}
                            Analizi Kaydet ve Yorumla
                          </button>
                        </div>
                      </form>

                      <div className="grid gap-8">
                        {soilReports.map(report => (
                          <div key={report.id} className="space-y-6">
                            <div className="bg-white dark:bg-zinc-800 p-6 rounded-3xl border border-farm-olive/5">
                              <div className="flex justify-between items-start mb-4">
                                <span className="text-xs font-bold text-farm-olive/40">{new Date(report.createdAt).toLocaleDateString('tr-TR')}</span>
                                <button onClick={() => handleDelete('soilAnalysis', report.id)} className="text-red-400"><Trash2 size={16} /></button>
                              </div>
                              <div className="prose prose-sm dark:prose-invert max-w-none">
                                <ReactMarkdown>{report.analysisResult}</ReactMarkdown>
                              </div>
                            </div>
                            
                            {/* Advanced Soil Charts */}
                            <SoilAnalysisCharts analysis={report} />
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {farmerToolTab === 'hasat' && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                      <div>
                        <h3 className="text-3xl serif text-farm-olive dark:text-farm-cream mb-2">Hasat Tahmini</h3>
                        <p className="text-gray-500 text-sm">Mahsulünüzün fotoğrafını çekin, ne zaman hasat edeceğinizi öğrenin.</p>
                      </div>

                      <div className="bg-farm-cream dark:bg-zinc-800/50 p-8 rounded-[32px] border border-farm-olive/10 text-center">
                        <input 
                          type="file" 
                          accept="image/*" 
                          id="harvest-upload" 
                          className="hidden" 
                          onChange={(e) => e.target.files?.[0] && handleHarvestPrediction(e.target.files[0])}
                        />
                        <label htmlFor="harvest-upload" className="cursor-pointer block">
                          <div className="w-20 h-20 bg-farm-olive/10 rounded-full flex items-center justify-center text-farm-olive mx-auto mb-4">
                            <Camera size={32} />
                          </div>
                          <p className="font-bold text-farm-olive dark:text-farm-cream">Fotoğraf Yükle ve Analiz Et</p>
                        </label>
                      </div>

                      <div className="grid gap-6">
                        {harvestPredictions.map(pred => (
                          <div key={pred.id} className="bg-white dark:bg-zinc-800 rounded-3xl overflow-hidden border border-farm-olive/5 flex flex-col md:flex-row">
                            <img src={pred.imageUrl} alt="Hasat" className="md:w-48 h-48 object-cover" />
                            <div className="p-6 flex-grow">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-farm-olive dark:text-farm-cream">{pred.cropType}</h4>
                                <span className="text-xs text-gray-400">{new Date(pred.createdAt).toLocaleDateString('tr-TR')}</span>
                              </div>
                              <p className="text-sm text-farm-olive/60 mb-4 font-medium">{pred.maturityLevel}</p>
                              <div className="text-sm text-gray-600 dark:text-zinc-400 italic">
                                <ReactMarkdown>{pred.recommendation}</ReactMarkdown>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {farmerToolTab === 'don' && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                      <div>
                        <h3 className="text-3xl serif text-farm-olive dark:text-farm-cream mb-2">Zirai Don Uyarı Sistemi</h3>
                        <p className="text-gray-500 text-sm">Anlık hava durumu verileriyle mahsulünüzü koruyun.</p>
                      </div>

                      <div className={cn(
                        "p-12 rounded-[48px] text-center border-2 transition-all",
                        weather && weather.temp <= 2 
                          ? "bg-red-500/10 border-red-500/20 text-red-600" 
                          : "bg-green-500/10 border-green-500/20 text-green-600"
                      )}>
                        <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 bg-white shadow-xl">
                          {weather && weather.temp <= 2 ? (
                            <AlertTriangle size={48} className="text-red-500 animate-pulse" />
                          ) : (
                            <Sun size={48} className="text-green-500" />
                          )}
                        </div>
                        <h4 className="text-4xl font-bold mb-4">
                          {weather ? `${weather.temp}°C` : '--°C'}
                        </h4>
                        <p className="text-xl font-medium mb-8">
                          {weather && weather.temp <= 2 
                            ? "DİKKAT: Zirai Don Riski Yüksek!" 
                            : "Şu an için don riski bulunmuyor."}
                        </p>
                        <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                          <div className="bg-white/50 p-6 rounded-3xl">
                            <span className="block text-xs uppercase font-bold opacity-60 mb-1">Nem Oranı</span>
                            <span className="text-2xl font-bold">{weather?.humidity || 0}%</span>
                          </div>
                          <div className="bg-white/50 p-6 rounded-3xl">
                            <span className="block text-xs uppercase font-bold opacity-60 mb-1">Rüzgar Hızı</span>
                            <span className="text-2xl font-bold">{weather?.windSpeed || 0} km/s</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-zinc-800 p-8 rounded-[32px] border border-farm-olive/5">
                        <h5 className="font-bold mb-4 flex items-center gap-2">
                          <Zap size={18} className="text-yellow-500" /> Don Önleme Tavsiyeleri
                        </h5>
                        <ul className="space-y-3 text-sm text-gray-600 dark:text-zinc-400">
                          <li className="flex items-start gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-farm-olive mt-1.5 shrink-0" />
                            <span>Toprak nemini korumak için hafif sulama yapın.</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-farm-olive mt-1.5 shrink-0" />
                            <span>Hassas fidelerin üzerini örtü altı sistemlerle kapatın.</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-farm-olive mt-1.5 shrink-0" />
                            <span>Dumanlama veya rüzgar makinelerini aktif hale getirin.</span>
                          </li>
                        </ul>
                      </div>
                    </motion.div>
                  )}

                  {farmerToolTab === 'ilaclama' && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                      <div>
                        <h3 className="text-3xl serif text-farm-olive dark:text-farm-cream mb-2">İlaçlama Rehberi & Takvimi</h3>
                        <p className="text-gray-500 text-sm">Hangi ürüne, ne zaman ve hangi dozda ilaçlama yapmanız gerektiğini öğrenin.</p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-farm-cream dark:bg-zinc-800/50 p-8 rounded-[32px] border border-farm-olive/10">
                          <h4 className="font-bold mb-6 flex items-center gap-2 text-farm-olive dark:text-farm-cream">
                            <FlaskConical size={20} /> Hızlı Bilgi Al
                          </h4>
                          <div className="space-y-4">
                            <p className="text-sm text-gray-600 dark:text-zinc-400 mb-4">
                              Ürününüzü ve karşılaştığınız sorunu yazın, AI size en uygun ilaçlama programını çıkarsın.
                            </p>
                            <div className="space-y-4">
                              <input 
                                type="text" 
                                placeholder="Ürün (Örn: Domates)"
                                className="w-full bg-white dark:bg-zinc-900 border-none rounded-xl px-4 py-3 text-sm"
                                id="spray-crop"
                              />
                              <textarea 
                                placeholder="Sorun veya Zararlı (Örn: Yaprak Biti)"
                                className="w-full bg-white dark:bg-zinc-900 border-none rounded-xl px-4 py-3 text-sm min-h-[100px]"
                                id="spray-issue"
                              ></textarea>
                              <button 
                                onClick={async () => {
                                  const crop = (document.getElementById('spray-crop') as HTMLInputElement).value;
                                  const issue = (document.getElementById('spray-issue') as HTMLTextAreaElement).value;
                                  if (!crop || !issue) {
                                    toast.error("Lütfen ürün ve sorun bilgilerini girin.");
                                    return;
                                  }
                                  setIsChatting(true);
                                  try {
                                    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
                                    const response = await ai.models.generateContent({
                                      model: "gemini-2.5-flash-preview-tts",
                                      contents: `Tarımsal ilaçlama uzmanı olarak yanıtla. ${crop} ürününde görülen ${issue} için ilaçlama takvimi, dozaj ve güvenlik önlemleri (bekleme süresi vb.) hakkında detaylı bilgi ver.`
                                    });
                                    setAnalysisResult(response.text);
                                    // Open AI tab to show result or show in a modal
                                    setFarmerToolTab('ai');
                                    setChatMessages(prev => [...prev, {
                                      id: Date.now().toString(),
                                      userId: user?.uid || 'anonymous',
                                      role: 'model',
                                      content: response.text,
                                      createdAt: new Date().toISOString()
                                    }]);
                                  } catch (err) {
                                    toast.error("Bilgi alınırken bir hata oluştu.");
                                  } finally {
                                    setIsChatting(false);
                                  }
                                }}
                                className="w-full bg-farm-olive text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2"
                              >
                                <Sparkles size={20} /> Rehber Oluştur
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white dark:bg-zinc-800 p-8 rounded-[32px] border border-farm-olive/5">
                          <h4 className="font-bold mb-6 text-farm-olive dark:text-farm-cream">Genel İlaçlama Kuralları</h4>
                          <div className="space-y-4">
                            {[
                              { title: "Rüzgar Hızı", desc: "İlaçlama yaparken rüzgar hızının 15 km/s altında olduğundan emin olun." },
                              { title: "Sıcaklık", desc: "Günün en sıcak saatlerinde ilaçlama yapmaktan kaçının (Sabah erken veya akşam üzeri)." },
                              { title: "Ekipman", desc: "Her zaman koruyucu maske, eldiven ve gözlük kullanın." },
                              { title: "Bekleme Süresi", desc: "İlaçlama ile hasat arasındaki süreye (PHI) mutlaka uyun." }
                            ].map((rule, i) => (
                              <div key={i} className="flex gap-4">
                                <div className="w-8 h-8 rounded-lg bg-farm-olive/10 flex items-center justify-center text-farm-olive shrink-0 font-bold text-xs">
                                  {i + 1}
                                </div>
                                <div>
                                  <h5 className="font-bold text-sm mb-1">{rule.title}</h5>
                                  <p className="text-xs text-gray-500">{rule.desc}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        <section id="galeri" className="py-24 bg-farm-cream dark:bg-zinc-950 transition-colors">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-5xl serif text-farm-olive mb-12 text-center">Fotoğraf ve Video Galerisi</h2>
            <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
              {galleryItems.length > 0 ? galleryItems.map(item => (
                <div key={item.id} className="relative group rounded-2xl overflow-hidden break-inside-avoid shadow-md">
                  {isAdmin && (
                    <button 
                      onClick={() => handleDelete('galleryItems', item.id, item.userId)}
                      className="absolute top-4 right-4 z-20 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                  {(user && item.userId === user.uid) && (
                    <button 
                      onClick={() => handleDelete('galleryItems', item.id, item.userId)}
                      className="absolute top-4 right-14 z-20 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                  <img 
                    src={item.url} 
                    alt={item.caption} 
                    className="w-full h-auto object-cover transition-transform group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                    <p className="text-white font-medium">{item.caption}</p>
                    <div className="flex items-center gap-2 text-white/60 text-xs mt-2">
                      {item.type === 'video' ? <Video size={14} /> : <ImageIcon size={14} />}
                      <span>{new Date(item.createdAt).toLocaleDateString('tr-TR')}</span>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-12 text-gray-400 italic w-full">Galeri henüz boş.</div>
              )}
            </div>
          </div>
        </section>



        {/* Yönetim Section */}
        <section id="yonetim" className="py-24 bg-farm-olive text-white">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-12">
              <Settings className="mx-auto mb-4 opacity-50" size={48} />
              <h2 className="text-5xl serif mb-4">Yönetim Alanı</h2>
              <p className="text-white/60">Sadece yetkili admin (Siz) içerik ekleyebilir.</p>
            </div>

            {!isAdmin ? (
              <div className="bg-white/10 backdrop-blur-md p-12 rounded-3xl border border-white/20 text-center">
                <LogIn className="mx-auto mb-4 opacity-50" size={48} />
                <h3 className="text-2xl font-bold mb-4">Admin Erişimi</h3>
                <p className="text-white/60 mb-8">
                  Bu alan sadece site sahibine özeldir. Lütfen admin hesabınızla giriş yapın.
                </p>
                {!user ? (
                  <button 
                    onClick={handleLogin}
                    className="bg-white text-farm-olive px-8 py-3 rounded-full font-bold hover:bg-white/90 transition-all flex items-center gap-2 mx-auto"
                  >
                    <LogIn size={20} /> Google ile Giriş Yap
                  </button>
                ) : (
                  <div className="text-red-300 font-medium">
                    Bu hesap ({user.email}) admin yetkisine sahip değil.
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-8">
                <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-yellow-300"><ImageIcon size={20} /> Fotoğraf Yükleme Testi</h3>
                  <p className="text-sm text-white/60 mb-6 italic">Eğer fotoğraflar yüklenmiyorsa, lütfen buradan bir test yapın ve konsol çıktılarını kontrol edin.</p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            toast.loading("Test yüklemesi başlatıldı...", { id: 'test-upload' });
                            const url = await handleFileUpload(file, 'test');
                            toast.success(`Yükleme başarılı!`, { id: 'test-upload' });
                            console.log("Test upload success:", url);
                          } catch (err) {
                            toast.error("Test yüklemesi başarısız oldu.", { id: 'test-upload' });
                            console.error("Test upload failed:", err);
                          }
                        }
                      }}
                      className="hidden"
                      id="test-upload-input"
                    />
                    <label htmlFor="test-upload-input" className="flex-grow bg-white/20 hover:bg-white/30 border border-white/20 rounded-xl p-4 cursor-pointer text-center text-sm font-bold transition-all flex items-center justify-center gap-2">
                      <Upload size={18} /> Test Fotoğrafı Seç ve Yükle
                    </label>
                    <div className="flex-grow bg-white/5 border border-white/10 rounded-xl p-4 text-[10px] font-mono overflow-hidden">
                      <div className="text-white/40 mb-1 uppercase tracking-widest">Sistem Durumu:</div>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${storage ? 'bg-green-400' : 'bg-red-400'}`}></div>
                        <span>Firebase Storage: {storage ? 'Bağlı' : 'Bağlı Değil'}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className={`w-2 h-2 rounded-full ${db ? 'bg-green-400' : 'bg-red-400'}`}></div>
                        <span>Firestore: {db ? 'Bağlı' : 'Bağlı Değil'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Add Blog Post */}
                  <form onSubmit={handleAddBlogPost} className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Plus size={20} /> Yeni Blog Yazısı</h3>
                    <div className="space-y-4">
                      <input 
                        type="text" 
                        placeholder="Başlık" 
                        value={newPost.title}
                        onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                        className="w-full bg-white/10 border border-white/20 rounded-xl p-3 outline-none focus:ring-2 focus:ring-white"
                        required
                      />
                      <div className="space-y-2">
                        <label className="text-xs text-white/60 block">Görsel Yükle</label>
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const url = await handleFileUpload(file, 'blog');
                              setNewPost({ ...newPost, imageUrl: url });
                            }
                          }}
                          className="w-full text-sm text-white/60 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-white file:text-farm-olive hover:file:bg-white/90"
                        />
                        {newPost.imageUrl && <div className="text-[10px] text-green-300 truncate">Yüklendi: {newPost.imageUrl}</div>}
                      </div>
                      <input 
                        type="text" 
                        placeholder="Yazar" 
                        value={newPost.author}
                        onChange={(e) => setNewPost({ ...newPost, author: e.target.value })}
                        className="w-full bg-white/10 border border-white/20 rounded-xl p-3 outline-none focus:ring-2 focus:ring-white"
                        required
                      />
                      <textarea 
                        placeholder="İçerik (Markdown desteklenir)" 
                        value={newPost.content}
                        onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                        className="w-full bg-white/10 border border-white/20 rounded-xl p-3 outline-none focus:ring-2 focus:ring-white min-h-[150px]"
                        required
                      ></textarea>
                      <button 
                        type="submit" 
                        disabled={isUploading}
                        className="w-full bg-white text-farm-olive py-3 rounded-xl font-bold disabled:opacity-50"
                      >
                        {isUploading ? 'Yükleniyor...' : 'Yayınla'}
                      </button>
                    </div>
                  </form>

                  {/* Add Crop Price */}
                  <form onSubmit={handleAddCropPrice} className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Plus size={20} /> Yeni Mahsül Fiyatı</h3>
                    <div className="space-y-4">
                      <input 
                        type="text" 
                        placeholder="Ürün Adı" 
                        value={newPrice.name}
                        onChange={(e) => setNewPrice({ ...newPrice, name: e.target.value })}
                        className="w-full bg-white/10 border border-white/20 rounded-xl p-3 outline-none focus:ring-2 focus:ring-white"
                        required
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <input 
                          type="number" 
                          placeholder="Fiyat" 
                          value={newPrice.price || ''}
                          onChange={(e) => setNewPrice({ ...newPrice, price: Number(e.target.value) })}
                          className="w-full bg-white/10 border border-white/20 rounded-xl p-3 outline-none focus:ring-2 focus:ring-white"
                          required
                        />
                        <input 
                          type="text" 
                          placeholder="Birim (kg, ton)" 
                          value={newPrice.unit}
                          onChange={(e) => setNewPrice({ ...newPrice, unit: e.target.value })}
                          className="w-full bg-white/10 border border-white/20 rounded-xl p-3 outline-none focus:ring-2 focus:ring-white"
                          required
                        />
                      </div>
                      <select 
                        value={newPrice.trend}
                        onChange={(e) => setNewPrice({ ...newPrice, trend: e.target.value as any })}
                        className="w-full bg-white/10 border border-white/20 rounded-xl p-3 outline-none focus:ring-2 focus:ring-white"
                      >
                        <option value="stable" className="text-gray-900">Sabit</option>
                        <option value="up" className="text-gray-900">Yükselişte</option>
                        <option value="down" className="text-gray-900">Düşüşte</option>
                      </select>
                      <input 
                        type="text" 
                        placeholder="Şehir" 
                        value={newPrice.city}
                        onChange={(e) => setNewPrice({ ...newPrice, city: e.target.value })}
                        className="w-full bg-white/10 border border-white/20 rounded-xl p-3 outline-none focus:ring-2 focus:ring-white"
                        required
                      />
                      <button type="submit" className="w-full bg-white text-farm-olive py-3 rounded-xl font-bold">Kaydet</button>
                    </div>
                  </form>
                  {/* Add Gallery Item */}
                  <form onSubmit={handleAddGalleryItem} className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Plus size={20} /> Galeriye Medya Ekle</h3>
                    <div className="space-y-4">
                      <input 
                        type="text" 
                        placeholder="Başlık" 
                        value={newGallery.caption}
                        onChange={(e) => setNewGallery({ ...newGallery, caption: e.target.value })}
                        className="w-full bg-white/10 border border-white/20 rounded-xl p-3 outline-none focus:ring-2 focus:ring-white"
                        required
                      />
                      <div className="space-y-2">
                        <label className="text-xs text-white/60 block">Görsel/Video Yükle</label>
                        <input 
                          type="file" 
                          accept="image/*,video/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const url = await handleFileUpload(file, 'gallery');
                              setNewGallery({ 
                                ...newGallery, 
                                url, 
                                type: file.type.startsWith('video') ? 'video' : 'image' 
                              });
                            }
                          }}
                          className="w-full text-sm text-white/60 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-white file:text-farm-olive hover:file:bg-white/90"
                        />
                        {newGallery.url && <div className="text-[10px] text-green-300 truncate">Yüklendi: {newGallery.url}</div>}
                      </div>
                      <button 
                        type="submit" 
                        disabled={isUploading}
                        className="w-full bg-white text-farm-olive py-3 rounded-xl font-bold disabled:opacity-50"
                      >
                        {isUploading ? 'Yükleniyor...' : 'Ekle'}
                      </button>
                    </div>
                  </form>
                  {/* Add Stock Item */}
                  <form onSubmit={handleAddStock} className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Plus size={20} /> Tarlada Ne Var? (Stok)</h3>
                    <div className="space-y-4">
                      <input 
                        type="text" 
                        placeholder="Ürün Adı" 
                        value={newStock.name}
                        onChange={(e) => setNewStock({ ...newStock, name: e.target.value })}
                        className="w-full bg-white/10 border border-white/20 rounded-xl p-3 outline-none focus:ring-2 focus:ring-white"
                        required
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <input 
                          type="number" 
                          placeholder="Miktar (Ton)" 
                          value={newStock.quantity}
                          onChange={(e) => setNewStock({ ...newStock, quantity: e.target.value })}
                          className="w-full bg-white/10 border border-white/20 rounded-xl p-3 outline-none focus:ring-2 focus:ring-white"
                          required
                        />
                        <input 
                          type="number" 
                          placeholder="Fiyat (Ton Başına)" 
                          value={newStock.price}
                          onChange={(e) => setNewStock({ ...newStock, price: parseFloat(e.target.value) })}
                          className="w-full bg-white/10 border border-white/20 rounded-xl p-3 outline-none focus:ring-2 focus:ring-white"
                          required
                        />
                      </div>
                      <select 
                        value={newStock.status}
                        onChange={(e) => setNewStock({ ...newStock, status: e.target.value as any })}
                        className="w-full bg-white/10 border border-white/20 rounded-xl p-3 outline-none focus:ring-2 focus:ring-white"
                      >
                        <option value="available" className="text-gray-900">Mevcut</option>
                        <option value="low" className="text-gray-900">Azaldı</option>
                        <option value="sold-out" className="text-gray-900">Tükendi</option>
                      </select>
                      <button type="submit" className="w-full bg-white text-farm-olive py-3 rounded-xl font-bold">Ekle</button>
                    </div>
                  </form>

                  {/* Add Weather Alert */}
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    const form = e.target as HTMLFormElement;
                    const formData = new FormData(form);
                    try {
                      await addDoc(collection(db, 'weatherAlerts'), {
                        type: formData.get('type'),
                        severity: formData.get('severity'),
                        message: formData.get('message'),
                        city: 'Niğde',
                        createdAt: new Date().toISOString(),
                        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
                      });
                      toast.success("Uyarı eklendi!");
                      form.reset();
                    } catch (err) {
                      handleFirestoreError(err, OperationType.CREATE, 'weatherAlerts');
                    }
                  }} className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Bell size={20} /> Hava Durumu Uyarısı</h3>
                    <div className="space-y-4">
                      <select name="type" className="w-full bg-white/10 border border-white/20 rounded-xl p-3 outline-none focus:ring-2 focus:ring-white">
                        <option value="frost" className="text-gray-900">Don</option>
                        <option value="storm" className="text-gray-900">Fırtına</option>
                        <option value="heat" className="text-gray-900">Aşırı Sıcak</option>
                        <option value="rain" className="text-gray-900">Aşırı Yağış</option>
                      </select>
                      <select name="severity" className="w-full bg-white/10 border border-white/20 rounded-xl p-3 outline-none focus:ring-2 focus:ring-white">
                        <option value="info" className="text-gray-900">Bilgi</option>
                        <option value="warning" className="text-gray-900">Uyarı</option>
                        <option value="critical" className="text-gray-900">Kritik</option>
                      </select>
                      <textarea name="message" placeholder="Uyarı Mesajı" className="w-full bg-white/10 border border-white/20 rounded-xl p-3 outline-none focus:ring-2 focus:ring-white min-h-[100px]" required />
                      <button type="submit" className="w-full bg-white text-farm-olive py-3 rounded-xl font-bold">Yayınla</button>
                    </div>
                  </form>

                  {/* Add News */}
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    const form = e.target as HTMLFormElement;
                    const formData = new FormData(form);
                    try {
                      await addDoc(collection(db, 'news'), {
                        title: formData.get('title'),
                        content: formData.get('content'),
                        category: formData.get('category'),
                        createdAt: new Date().toISOString()
                      });
                      toast.success("Haber eklendi!");
                      form.reset();
                    } catch (err) {
                      handleFirestoreError(err, OperationType.CREATE, 'news');
                    }
                  }} className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Newspaper size={20} /> Yeni Haber / Duyuru</h3>
                    <div className="space-y-4">
                      <input name="title" type="text" placeholder="Haber Başlığı" className="w-full bg-white/10 border border-white/20 rounded-xl p-3 outline-none focus:ring-2 focus:ring-white" required />
                      <select name="category" className="w-full bg-white/10 border border-white/20 rounded-xl p-3 outline-none focus:ring-2 focus:ring-white">
                        <option value="policy" className="text-gray-900">Politika</option>
                        <option value="weather" className="text-gray-900">Hava Durumu</option>
                        <option value="market" className="text-gray-900">Piyasa</option>
                        <option value="general" className="text-gray-900">Genel</option>
                      </select>
                      <textarea name="content" placeholder="Haber İçeriği" className="w-full bg-white/10 border border-white/20 rounded-xl p-3 outline-none focus:ring-2 focus:ring-white min-h-[150px]" required />
                      <button type="submit" className="w-full bg-white text-farm-olive py-3 rounded-xl font-bold">Yayınla</button>
                    </div>
                  </form>

                  {/* Add Recipe */}
                  <form onSubmit={handleAddRecipe} className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Utensils size={20} /> Yeni Tarif</h3>
                    <div className="space-y-4">
                      <input 
                        type="text" 
                        placeholder="Tarif Başlığı" 
                        value={newRecipe.title}
                        onChange={(e) => setNewRecipe({ ...newRecipe, title: e.target.value })}
                        className="w-full bg-white/10 border border-white/20 rounded-xl p-3 outline-none focus:ring-2 focus:ring-white"
                        required
                      />
                      <input 
                        type="text" 
                        placeholder="Malzemeler (Virgülle ayırın)" 
                        value={newRecipe.ingredients}
                        onChange={(e) => setNewRecipe({ ...newRecipe, ingredients: e.target.value })}
                        className="w-full bg-white/10 border border-white/20 rounded-xl p-3 outline-none focus:ring-2 focus:ring-white"
                        required
                      />
                      <textarea 
                        placeholder="Hazırlanışı" 
                        value={newRecipe.instructions}
                        onChange={(e) => setNewRecipe({ ...newRecipe, instructions: e.target.value })}
                        className="w-full bg-white/10 border border-white/20 rounded-xl p-3 outline-none focus:ring-2 focus:ring-white min-h-[100px]"
                        required
                      />
                      <div className="flex gap-2">
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const url = await handleFileUpload(file, 'recipes');
                              setNewRecipe({ ...newRecipe, imageUrl: url });
                            }
                          }}
                          className="hidden"
                          id="recipe-upload"
                        />
                        <label htmlFor="recipe-upload" className="flex-grow bg-white/10 border border-white/20 rounded-xl p-3 cursor-pointer text-center text-sm">
                          {newRecipe.imageUrl ? "Görsel Yüklendi ✅" : "Görsel Seç"}
                        </label>
                      </div>
                      <button type="submit" className="w-full bg-white text-farm-olive py-3 rounded-xl font-bold">Ekle</button>
                    </div>
                  </form>
                </div>

                <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 mt-8">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Settings size={20} /> İçerik Yönetimi</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <p className="text-sm font-bold mb-3">Haberler ({news.length})</p>
                      <div className="max-h-40 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                        {news.map(item => (
                          <div key={item.id} className="flex items-center justify-between text-xs p-2 bg-white/5 rounded-lg">
                            <span className="truncate mr-2">{item.title}</span>
                            <button onClick={() => handleDelete('news', item.id!)} className="text-red-400 hover:text-red-300"><Trash2 size={14} /></button>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <p className="text-sm font-bold mb-3">Mahsül Fiyatları ({cropPrices.length})</p>
                      <div className="max-h-40 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                        {cropPrices.map(item => (
                          <div key={item.id} className="flex items-center justify-between text-xs p-2 bg-white/5 rounded-lg">
                            <span className="truncate mr-2">{item.cropName} ({item.city})</span>
                            <button onClick={() => handleDelete('cropPrices', item.id!)} className="text-red-400 hover:text-red-300"><Trash2 size={14} /></button>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <p className="text-sm font-bold mb-3">Blog Yazıları ({blogPosts.length})</p>
                      <div className="max-h-40 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                        {blogPosts.map(post => (
                          <div key={post.id} className="flex items-center justify-between text-xs p-2 bg-white/5 rounded-lg">
                            <span className="truncate mr-2">{post.title}</span>
                            <button onClick={() => handleDelete('blogPosts', post.id!)} className="text-red-400 hover:text-red-300"><Trash2 size={14} /></button>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <p className="text-sm text-gray-500 font-bold mb-3">Stok ({stockItems.length})</p>
                      <div className="max-h-40 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                        {stockItems.map(item => (
                          <div key={item.id} className="flex items-center justify-between text-xs p-2 bg-white/5 rounded-lg">
                            <span className="truncate mr-2">{item.name} ({item.quantity} ton)</span>
                            <button onClick={() => handleDelete('stockItems', item.id!)} className="text-red-400 hover:text-red-300"><Trash2 size={14} /></button>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <p className="text-sm font-bold mb-3">Galeri ({galleryItems.length})</p>
                      <div className="max-h-40 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                        {galleryItems.map(item => (
                          <div key={item.id} className="flex items-center justify-between text-xs p-2 bg-white/5 rounded-lg">
                            <span className="truncate mr-2">{item.caption || 'Adsız'}</span>
                            <button onClick={() => handleDelete('galleryItems', item.id!)} className="text-red-400 hover:text-red-300"><Trash2 size={14} /></button>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <p className="text-sm font-bold mb-3">Tarifler ({recipes.length})</p>
                      <div className="max-h-40 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                        {recipes.map(recipe => (
                          <div key={recipe.id} className="flex items-center justify-between text-xs p-2 bg-white/5 rounded-lg">
                            <span className="truncate mr-2">{recipe.title}</span>
                            <button onClick={() => handleDelete('recipes', recipe.id!)} className="text-red-400 hover:text-red-300"><Trash2 size={14} /></button>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <p className="text-sm font-bold mb-3">Pazar Ürünleri ({marketplaceItems.length})</p>
                      <div className="max-h-40 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                        {marketplaceItems.map(item => (
                          <div key={item.id} className="flex items-center justify-between text-xs p-2 bg-white/5 rounded-lg">
                            <span className="truncate mr-2">{item.name}</span>
                            <button onClick={() => handleDelete('marketplaceItems', item.id!)} className="text-red-400 hover:text-red-300"><Trash2 size={14} /></button>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <p className="text-sm font-bold mb-3">Takvim Etkinlikleri ({harvestEvents.length})</p>
                      <div className="max-h-40 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                        {harvestEvents.map(event => (
                          <div key={event.id} className="flex items-center justify-between text-xs p-2 bg-white/5 rounded-lg">
                            <span className="truncate mr-2">{event.cropName} ({months[event.month]})</span>
                            <button onClick={() => handleDelete('harvestEvents', event.id!)} className="text-red-400 hover:text-red-300"><Trash2 size={14} /></button>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <p className="text-sm font-bold mb-3">İlanlar ({equipmentListings.length})</p>
                      <div className="max-h-40 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                        {equipmentListings.map(listing => (
                          <div key={listing.id} className="flex items-center justify-between text-xs p-2 bg-white/5 rounded-lg">
                            <span className="truncate mr-2">{listing.title}</span>
                            <button onClick={() => handleDelete('equipmentListings', listing.id!)} className="text-red-400 hover:text-red-300"><Trash2 size={14} /></button>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <p className="text-sm font-bold mb-3">Müşteri Yorumları ({customerReviews.length})</p>
                      <div className="max-h-40 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                        {customerReviews.map(review => (
                          <div key={review.id} className="flex items-center justify-between text-xs p-2 bg-white/5 rounded-lg">
                            <span className="truncate mr-2">{review.userName}: {review.comment.substring(0, 20)}...</span>
                            <button onClick={() => handleDelete('customerReviews', review.id!)} className="text-red-400 hover:text-red-300"><Trash2 size={14} /></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 mt-8">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Truck size={20} /> Ekipman & İş Gücü İlanı Ver</h3>
                  <form onSubmit={handleAddListing} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <select 
                        value={newListing.type}
                        onChange={(e) => setNewListing({ ...newListing, type: e.target.value as any })}
                        className="w-full bg-white/10 border border-white/20 rounded-xl p-3 outline-none focus:ring-2 focus:ring-white"
                      >
                        <option value="equipment" className="text-gray-900">Ekipman</option>
                        <option value="labor" className="text-gray-900">İş Gücü</option>
                      </select>
                      <input 
                        type="text" 
                        placeholder="Başlık" 
                        value={newListing.title}
                        onChange={(e) => setNewListing({ ...newListing, title: e.target.value })}
                        className="w-full bg-white/10 border border-white/20 rounded-xl p-3 outline-none focus:ring-2 focus:ring-white"
                        required
                      />
                    </div>
                    <textarea 
                      placeholder="Açıklama" 
                      value={newListing.description}
                      onChange={(e) => setNewListing({ ...newListing, description: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-xl p-3 outline-none focus:ring-2 focus:ring-white min-h-[80px]"
                      required
                    />
                    <div className="grid grid-cols-3 gap-4">
                      <input 
                        type="number" 
                        placeholder="Fiyat" 
                        value={newListing.price}
                        onChange={(e) => setNewListing({ ...newListing, price: parseInt(e.target.value) })}
                        className="w-full bg-white/10 border border-white/20 rounded-xl p-3 outline-none focus:ring-2 focus:ring-white"
                        required
                      />
                      <input 
                        type="text" 
                        placeholder="Birim (gün, saat, dönüm)" 
                        value={newListing.unit}
                        onChange={(e) => setNewListing({ ...newListing, unit: e.target.value })}
                        className="w-full bg-white/10 border border-white/20 rounded-xl p-3 outline-none focus:ring-2 focus:ring-white"
                        required
                      />
                      <input 
                        type="tel" 
                        placeholder="Telefon" 
                        value={newListing.contactPhone}
                        onChange={(e) => setNewListing({ ...newListing, contactPhone: e.target.value })}
                        className="w-full bg-white/10 border border-white/20 rounded-xl p-3 outline-none focus:ring-2 focus:ring-white"
                        required
                      />
                    </div>
                    <button type="submit" className="w-full bg-white text-farm-olive py-3 rounded-xl font-bold">İlanı Yayınla</button>
                  </form>
                </div>

                <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 mt-8">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Star size={20} /> Müşteri Yorumu Ekle</h3>
                  <form onSubmit={handleAddReview} className="space-y-4">
                    <div className="flex gap-2 mb-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button 
                          key={star}
                          type="button"
                          onClick={() => setNewReview({ ...newReview, rating: star })}
                          className={cn(
                            "p-2 rounded-lg transition-all",
                            newReview.rating >= star ? "text-yellow-400" : "text-white/20"
                          )}
                        >
                          <Star size={24} fill={newReview.rating >= star ? "currentColor" : "none"} />
                        </button>
                      ))}
                    </div>
                    <textarea 
                      placeholder="Yorumunuz..." 
                      value={newReview.comment}
                      onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-xl p-3 outline-none focus:ring-2 focus:ring-white min-h-[100px]"
                      required
                    />
                    <button type="submit" className="w-full bg-white text-farm-olive py-3 rounded-xl font-bold">Yorumu Gönder</button>
                  </form>
                </div>

                <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 mt-8">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Plus size={20} /> Pazara Ürün Ekle</h3>
                  <form onSubmit={handleAddMarketplaceItem} className="space-y-4">
                    <input 
                      type="text" 
                      placeholder="Ürün Adı" 
                      value={newMarketplaceItem.name}
                      onChange={(e) => setNewMarketplaceItem({ ...newMarketplaceItem, name: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-xl p-3 outline-none focus:ring-2 focus:ring-white"
                      required
                    />
                    <textarea 
                      placeholder="Ürün Açıklaması" 
                      value={newMarketplaceItem.description}
                      onChange={(e) => setNewMarketplaceItem({ ...newMarketplaceItem, description: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-xl p-3 outline-none focus:ring-2 focus:ring-white min-h-[80px]"
                      required
                    />
                    <div className="grid grid-cols-3 gap-4">
                      <input 
                        type="number" 
                        placeholder="Fiyat" 
                        value={newMarketplaceItem.price}
                        onChange={(e) => setNewMarketplaceItem({ ...newMarketplaceItem, price: parseFloat(e.target.value) })}
                        className="w-full bg-white/10 border border-white/20 rounded-xl p-3 outline-none focus:ring-2 focus:ring-white"
                        required
                      />
                      <input 
                        type="text" 
                        placeholder="Birim (ton, kg vb.)" 
                        value={newMarketplaceItem.unit}
                        onChange={(e) => setNewMarketplaceItem({ ...newMarketplaceItem, unit: e.target.value })}
                        className="w-full bg-white/10 border border-white/20 rounded-xl p-3 outline-none focus:ring-2 focus:ring-white"
                        required
                      />
                      <input 
                        type="tel" 
                        placeholder="İletişim Telefonu" 
                        value={newMarketplaceItem.contactPhone}
                        onChange={(e) => setNewMarketplaceItem({ ...newMarketplaceItem, contactPhone: e.target.value })}
                        className="w-full bg-white/10 border border-white/20 rounded-xl p-3 outline-none focus:ring-2 focus:ring-white"
                        required
                      />
                    </div>
                    <select 
                      value={newMarketplaceItem.category}
                      onChange={(e) => setNewMarketplaceItem({ ...newMarketplaceItem, category: e.target.value as any })}
                      className="w-full bg-white/10 border border-white/20 rounded-xl p-3 outline-none focus:ring-2 focus:ring-white"
                    >
                      <option value="sebze" className="text-gray-900">Sebze</option>
                      <option value="meyve" className="text-gray-900">Meyve</option>
                      <option value="bakliyat" className="text-gray-900">Bakliyat</option>
                      <option value="diger" className="text-gray-900">Diğer</option>
                    </select>
                    <div className="flex gap-2">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const url = await handleFileUpload(file, 'marketplace');
                            setNewMarketplaceItem({ ...newMarketplaceItem, imageUrl: url });
                          }
                        }}
                        className="hidden"
                        id="marketplace-upload"
                      />
                      <label htmlFor="marketplace-upload" className="flex-grow bg-white/10 border border-white/20 rounded-xl p-3 cursor-pointer text-center text-sm">
                        {newMarketplaceItem.imageUrl ? "Görsel Yüklendi ✅" : "Görsel Seç"}
                      </label>
                    </div>
                    <button 
                      type="submit" 
                      disabled={isUploading}
                      className="w-full bg-white text-farm-olive py-3 rounded-xl font-bold disabled:opacity-50 disabled:hover:scale-100"
                    >
                      {isUploading ? 'Yükleniyor...' : 'Pazara Ekle'}
                    </button>
                  </form>
                </div>

                <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 mt-8">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Calendar size={20} /> Takvime Etkinlik Ekle</h3>
                  <form onSubmit={handleAddHarvest} className="space-y-4">
                    <input 
                      type="text" 
                      placeholder="Ürün Adı" 
                      value={newHarvest.cropName}
                      onChange={(e) => setNewHarvest({ ...newHarvest, cropName: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-xl p-3 outline-none focus:ring-2 focus:ring-white"
                      required
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <select 
                        value={newHarvest.action}
                        onChange={(e) => setNewHarvest({ ...newHarvest, action: e.target.value as any })}
                        className="w-full bg-white/10 border border-white/20 rounded-xl p-3 outline-none focus:ring-2 focus:ring-white"
                      >
                        <option value="planting" className="text-gray-900">Ekim</option>
                        <option value="harvesting" className="text-gray-900">Hasat</option>
                      </select>
                      <select 
                        value={newHarvest.month}
                        onChange={(e) => setNewHarvest({ ...newHarvest, month: parseInt(e.target.value) })}
                        className="w-full bg-white/10 border border-white/20 rounded-xl p-3 outline-none focus:ring-2 focus:ring-white"
                      >
                        {months.map((m, i) => <option key={m} value={i} className="text-gray-900">{m}</option>)}
                      </select>
                    </div>
                    <textarea 
                      placeholder="Kısa Açıklama" 
                      value={newHarvest.description}
                      onChange={(e) => setNewHarvest({ ...newHarvest, description: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-xl p-3 outline-none focus:ring-2 focus:ring-white min-h-[80px]"
                    />
                    <button type="submit" className="w-full bg-white text-farm-olive py-3 rounded-xl font-bold">Takvime Ekle</button>
                  </form>
                </div>

                <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 mt-8">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><LogOut size={20} /> Oturumu Kapat</h3>
                  <button 
                    onClick={handleLogout}
                    className="w-full bg-red-500/20 border border-red-500/40 text-red-200 py-4 rounded-2xl font-bold hover:bg-red-500/30 transition-all"
                  >
                    Çıkış Yap
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Farm Map Section */}
        <section id="harita" className="py-24 bg-farm-cream/50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-5xl serif text-farm-olive mb-4">İnteraktif Çiftlik Haritası</h2>
              <p className="text-gray-500">Tarlamızın hangi bölümünde ne ekili olduğunu görün.</p>
            </div>
            <div className="relative bg-white p-8 rounded-[48px] shadow-sm border border-farm-olive/10 overflow-hidden">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 aspect-[16/9] md:aspect-[21/9]">
                {[
                  { id: 1, name: 'Kuzey Tarlası', crop: 'Patates', color: 'bg-amber-100', icon: <TrendingUp className="text-amber-600" /> },
                  { id: 2, name: 'Güney Yamaç', crop: 'Buğday', color: 'bg-yellow-50', icon: <Sun className="text-yellow-600" /> },
                  { id: 3, name: 'Dere Kenarı', crop: 'Fasulye', color: 'bg-emerald-50', icon: <CloudRain className="text-emerald-600" /> },
                  { id: 4, name: 'Orta Bölge', crop: 'Arpa', color: 'bg-orange-50', icon: <Wind className="text-orange-600" /> },
                  { id: 5, name: 'Yeni Alan', crop: 'Nadas', color: 'bg-stone-100', icon: <Minus className="text-stone-600" /> },
                  { id: 6, name: 'Meyve Bahçesi', crop: 'Elma/Kiraz', color: 'bg-red-50', icon: <Plus className="text-red-600" /> },
                ].map(area => (
                  <motion.div 
                    key={area.id}
                    whileHover={{ scale: 1.02 }}
                    className={cn("rounded-3xl p-6 flex flex-col justify-between border border-black/5", area.color)}
                  >
                    <div className="w-10 h-10 bg-white/50 rounded-xl flex items-center justify-center">
                      {area.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">{area.name}</h4>
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-500">{area.crop}</p>
                    </div>
                  </motion.div>
                ))}
                <div className="col-span-2 bg-farm-olive/5 rounded-3xl p-8 flex items-center justify-center border-2 border-dashed border-farm-olive/20">
                  <div className="text-center">
                    <MapPin size={48} className="text-farm-olive mx-auto mb-4 opacity-20" />
                    <p className="text-farm-olive/60 font-medium italic">Çiftlik Merkezi ve Depolar</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>



        {/* Equipment & Labor Section */}
        <section id="ekipman" className="py-24 bg-farm-cream/50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-5xl serif text-farm-olive mb-4">Ekipman & İş Gücü Yardımlaşması</h2>
              <p className="text-gray-500">Ekipman kiralayın veya iş gücü desteği bulun. Köylüler arası yardımlaşma platformu.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {equipmentListings.map(listing => (
                <motion.div 
                  key={listing.id}
                  whileHover={{ y: -5 }}
                  className="bg-white p-8 rounded-[40px] shadow-sm border border-farm-olive/5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className={cn(
                        "px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                        listing.type === 'equipment' ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"
                      )}>
                        {listing.type === 'equipment' ? 'EKİPMAN' : 'İŞ GÜCÜ'}
                      </div>
                      <span className="text-sm font-bold text-farm-olive">{listing.price} ₺ / {listing.unit}</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{listing.title}</h3>
                    <p className="text-sm text-gray-500 mb-6">{listing.description}</p>
                  </div>
                  <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-farm-olive/10 rounded-full flex items-center justify-center text-farm-olive">
                        <Users size={14} />
                      </div>
                      <span className="text-xs font-bold text-gray-600">{listing.userName}</span>
                    </div>
                    <a 
                      href={`tel:${listing.contactPhone}`}
                      className="bg-farm-olive text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-farm-olive/90 transition-all flex items-center gap-2"
                    >
                      <Phone size={14} /> Ara
                    </a>
                  </div>
                </motion.div>
              ))}
              {equipmentListings.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-400 italic">
                  Henüz ilan bulunmuyor. İlk ilanı siz verin!
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Customer Reviews Section */}
        <section id="yorumlar" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-5xl serif text-farm-olive mb-4">Müşteri Yorumları</h2>
              <p className="text-gray-500">Sefilli.com'dan alışveriş yapanların deneyimleri.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {customerReviews.map(review => (
                <div key={review.id} className="bg-farm-cream p-8 rounded-[40px] border border-farm-olive/5">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} className={i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"} />
                    ))}
                  </div>
                  <p className="text-gray-600 italic mb-6 text-sm">"{review.comment}"</p>
                  <div className="flex items-center gap-3">
                    <img src={review.userPhoto || `https://ui-avatars.com/api/?name=${review.userName}`} alt={review.userName} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
                    <div>
                      <h4 className="font-bold text-sm text-gray-800">{review.userName}</h4>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest">{new Date(review.createdAt).toLocaleDateString('tr-TR')}</p>
                    </div>
                  </div>
                </div>
              ))}
              {customerReviews.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-400 italic">
                  Henüz yorum yapılmamış.
                </div>
              )}
            </div>
          </div>
        </section>



        {/* İletişim Section */}
        <section id="iletisim" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-16">
            <div>
              <h2 className="text-5xl serif text-farm-olive mb-8">İletişim</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-farm-cream rounded-2xl flex items-center justify-center text-farm-olive">
                    <MapPin />
                  </div>
                  <div>
                    <h4 className="font-bold">Bölge Bilgisi</h4>
                    <p className="text-gray-500">Antalya / Serik Bölgesi</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-farm-cream rounded-2xl flex items-center justify-center text-farm-olive">
                    <Phone />
                  </div>
                  <div>
                    <h4 className="font-bold">Telefon</h4>
                    <p className="text-gray-500">+90 (5xx) xxx xx xx</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-farm-cream rounded-2xl flex items-center justify-center text-farm-olive">
                    <Mail />
                  </div>
                  <div>
                    <h4 className="font-bold">E-posta</h4>
                    <p className="text-gray-500">iletisim@sefilli.com</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-farm-cream p-8 rounded-3xl shadow-sm">
              <h3 className="text-2xl font-bold mb-6">Bize Yazın</h3>
              <form onSubmit={handleSubmitContact} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input 
                    type="text" 
                    placeholder="İsim" 
                    value={newContact.name}
                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                    className="w-full bg-white border-none rounded-2xl p-4 focus:ring-2 focus:ring-farm-olive" 
                    required
                  />
                  <input 
                    type="email" 
                    placeholder="E-posta" 
                    value={newContact.email}
                    onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                    className="w-full bg-white border-none rounded-2xl p-4 focus:ring-2 focus:ring-farm-olive" 
                    required
                  />
                </div>
                <input 
                  type="text" 
                  placeholder="Konu" 
                  value={newContact.subject}
                  onChange={(e) => setNewContact({ ...newContact, subject: e.target.value })}
                  className="w-full bg-white border-none rounded-2xl p-4 focus:ring-2 focus:ring-farm-olive" 
                  required
                />
                <textarea 
                  placeholder="Mesajınız" 
                  value={newContact.message}
                  onChange={(e) => setNewContact({ ...newContact, message: e.target.value })}
                  className="w-full bg-white border-none rounded-2xl p-4 focus:ring-2 focus:ring-farm-olive min-h-[150px]"
                  required
                ></textarea>
                <button type="submit" className="w-full bg-farm-olive text-white py-4 rounded-2xl font-bold hover:bg-farm-olive/90 transition-all flex items-center justify-center gap-2">
                  <Send size={20} /> Mesajı Gönder
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      {/* Newsletter Section */}
      <section className="py-20 bg-farm-olive text-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-8">
            <MailCheck size={32} />
          </div>
          <h2 className="text-4xl serif mb-4">Hasat Bildirimlerine Abone Olun</h2>
          <p className="text-white/70 mb-8 max-w-xl mx-auto">Yeni mahsüllerimiz çıktığında ve hasat zamanı geldiğinde size haber verelim. Hiçbir taze ürünü kaçırmayın.</p>
          <form onSubmit={handleNewsletterSubscribe} className="max-w-md mx-auto flex gap-2">
            <input 
              type="email" 
              placeholder="E-posta adresiniz" 
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              className="flex-grow bg-white/10 border border-white/20 rounded-full px-6 py-3 outline-none focus:ring-2 focus:ring-white"
              required
            />
            <button 
              type="submit" 
              disabled={isSubscribing}
              className="bg-white text-farm-olive px-8 py-3 rounded-full font-bold hover:bg-farm-cream transition-all disabled:opacity-50"
            >
              {isSubscribing ? '...' : 'Abone Ol'}
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <Footer />
      {/* Chatbot Floating UI */}
      <div className="fixed bottom-6 right-6 z-[60]">
        <AnimatePresence>
          {isChatOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="absolute bottom-20 right-0 w-[350px] h-[500px] bg-white rounded-3xl shadow-2xl border border-farm-olive/10 flex flex-col overflow-hidden"
            >
              <div className="bg-farm-olive p-4 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot size={20} />
                  <span className="font-bold">Tarım Asistanı</span>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="p-1 hover:bg-white/20 rounded-full">
                  <X size={20} />
                </button>
              </div>
              <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-farm-cream/30">
                {botMessages.length === 0 && (
                  <div className="text-center text-gray-400 mt-10">
                    <Bot size={40} className="mx-auto mb-4 opacity-20" />
                    <p className="text-sm">Merhaba! Ben Sefilli.com asistanıyım. Size nasıl yardımcı olabilirim?</p>
                  </div>
                )}
                {botMessages.map((msg, i) => (
                  <div key={i} className={cn(
                    "max-w-[80%] p-3 rounded-2xl text-sm",
                    msg.role === 'user' ? "bg-farm-olive text-white ml-auto rounded-tr-none" : "bg-white text-gray-700 mr-auto rounded-tl-none border border-farm-olive/10"
                  )}>
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                ))}
                {isBotLoading && (
                  <div className="bg-white text-gray-700 mr-auto p-3 rounded-2xl rounded-tl-none border border-farm-olive/10 flex gap-1">
                    <span className="w-1.5 h-1.5 bg-farm-olive/40 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-farm-olive/40 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 bg-farm-olive/40 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                )}
              </div>
              <form onSubmit={handleChatSubmit} className="p-4 bg-white border-t border-farm-olive/10 flex gap-2">
                <input 
                  type="text" 
                  placeholder="Bir soru sorun..." 
                  value={botInput}
                  onChange={(e) => setBotInput(e.target.value)}
                  className="flex-grow bg-farm-cream/50 border border-farm-olive/10 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-farm-olive"
                />
                <button type="submit" className="bg-farm-olive text-white p-2 rounded-full hover:bg-farm-olive/90">
                  <Send size={18} />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
        <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="w-14 h-14 bg-farm-olive text-white rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-transform"
        >
          {isChatOpen ? <X /> : <Bot />}
        </button>
      </div>

      {/* Forum Modal */}
      <AnimatePresence>
        {isForumModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsForumModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-[40px] overflow-hidden shadow-2xl"
            >
              <div className="p-8 md:p-12">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-3xl serif text-farm-olive dark:text-farm-cream">Yeni Tartışma Başlat</h3>
                  <button onClick={() => setIsForumModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors">
                    <X size={24} className="text-gray-400" />
                  </button>
                </div>
                
                <form onSubmit={handleForumPost} className="space-y-6">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 block">Başlık</label>
                    <input 
                      type="text" 
                      value={newForumPost.title}
                      onChange={(e) => setNewForumPost({ ...newForumPost, title: e.target.value })}
                      placeholder="Konu başlığını yazın..."
                      className="w-full bg-farm-cream dark:bg-zinc-800 border border-farm-olive/10 dark:border-white/5 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-farm-olive transition-all dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 block">Kategori</label>
                    <select 
                      value={newForumPost.category}
                      onChange={(e) => setNewForumPost({ ...newForumPost, category: e.target.value as any })}
                      className="w-full bg-farm-cream dark:bg-zinc-800 border border-farm-olive/10 dark:border-white/5 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-farm-olive transition-all dark:text-white"
                    >
                      <option value="genel">Genel</option>
                      <option value="ekim">Ekim</option>
                      <option value="gubreleme">Gübreleme</option>
                      <option value="sulama">Sulama</option>
                      <option value="hasat">Hasat</option>
                      <option value="ekipman">Ekipman</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 block">İçerik</label>
                    <textarea 
                      value={newForumPost.content}
                      onChange={(e) => setNewForumPost({ ...newForumPost, content: e.target.value })}
                      placeholder="Sorunuzu veya tecrübenizi detaylandırın..."
                      className="w-full bg-farm-cream dark:bg-zinc-800 border border-farm-olive/10 dark:border-white/5 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-farm-olive transition-all min-h-[200px] dark:text-white"
                      required
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full bg-farm-olive text-white py-4 rounded-2xl font-bold text-lg hover:bg-farm-olive/90 transition-all shadow-xl shadow-farm-olive/20"
                  >
                    Yayınla
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
      </AnimatePresence>
    </div>
  );
}
