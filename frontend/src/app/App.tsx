import { useState, useCallback } from "react";
import {
  Search, MapPin, ChevronRight, Star, Clock, Calendar, Check,
  Film, ArrowLeft, Ticket, X, Crown, Building2, Popcorn, Mail,
  Lock, Eye, EyeOff, Phone, Globe, Navigation, Shield, Plus,
  Trash2, Edit3, LayoutDashboard, Clapperboard, MonitorPlay,
  Theater, Settings, LogOut, AlertCircle, Save, ChevronDown
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FilmType {
  id: number; title: string; year: number; genre: string[];
  rating: string; duration: number; score: number;
  director: string; cast: string[]; synopsis: string;
  heroImage: string; posterImage: string; tag: string;
}

interface CinemaType {
  id: number; name: string; area: string; address: string;
  screens: number; seats: number; phone: string;
  features: string[]; image: string;
}

interface ShowType {
  id: number; filmId: number; cinemaId: number;
  date: string; times: string[]; format: string;
}

// ─── Seed Data ────────────────────────────────────────────────────────────────

const SEED_FILMS: FilmType[] = [
  {
    id: 1, title: "Dune: Messiah", year: 2026, genre: ["Sci-Fi", "Epic"],
    rating: "PG-13", duration: 162, score: 9.1,
    director: "Denis Villeneuve",
    cast: ["Timothée Chalamet", "Zendaya", "Rebecca Ferguson"],
    synopsis: "Paul Atreides must contend with the forces that conspire to destroy the Fremen people and the delicate ecological balance of Arrakis.",
    heroImage: "https://images.unsplash.com/photo-1446776709462-d6b525b9c0c7?w=1600&h=900&fit=crop&auto=format",
    posterImage: "https://images.unsplash.com/photo-1446776709462-d6b525b9c0c7?w=400&h=600&fit=crop&auto=format",
    tag: "NOW SHOWING",
  },
  {
    id: 2, title: "The Brutalist", year: 2025, genre: ["Drama", "Historical"],
    rating: "R", duration: 215, score: 8.7,
    director: "Brady Corbet",
    cast: ["Adrien Brody", "Felicity Jones", "Guy Pearce"],
    synopsis: "A visionary Hungarian architect flees post-war Europe for America, where his singular vision and turbulent personal life collide with the New World.",
    heroImage: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1600&h=900&fit=crop&auto=format",
    posterImage: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400&h=600&fit=crop&auto=format",
    tag: "AWARD WINNER",
  },
  {
    id: 3, title: "Nosferatu", year: 2025, genre: ["Horror", "Gothic"],
    rating: "R", duration: 132, score: 8.3,
    director: "Robert Eggers",
    cast: ["Lily-Rose Depp", "Bill Skarsgård", "Nicholas Hoult"],
    synopsis: "A gothic tale of obsession between a haunted young woman in 1830s Germany and the ancient Transylvanian vampire who stalks her.",
    heroImage: "https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=1600&h=900&fit=crop&auto=format",
    posterImage: "https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=400&h=600&fit=crop&auto=format",
    tag: "NOW SHOWING",
  },
  {
    id: 4, title: "Anora", year: 2024, genre: ["Romance", "Drama"],
    rating: "R", duration: 139, score: 8.5,
    director: "Sean Baker",
    cast: ["Yura Borisov", "Mikey Madison"],
    synopsis: "A young woman from Brooklyn gets a chance at a Cinderella story when she impulsively marries the son of a Russian oligarch.",
    heroImage: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1600&h=900&fit=crop&auto=format",
    posterImage: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&h=600&fit=crop&auto=format",
    tag: "PALME D'OR",
  },
  {
    id: 5, title: "A Complete Unknown", year: 2024, genre: ["Biopic", "Music"],
    rating: "R", duration: 141, score: 8.2,
    director: "James Mangold",
    cast: ["Timothée Chalamet", "Elle Fanning", "Edward Norton"],
    synopsis: "The story of Bob Dylan's enigmatic rise in early 1960s New York City.",
    heroImage: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1600&h=900&fit=crop&auto=format",
    posterImage: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=600&fit=crop&auto=format",
    tag: "NOW SHOWING",
  },
  {
    id: 6, title: "Babygirl", year: 2024, genre: ["Thriller", "Drama"],
    rating: "R", duration: 114, score: 7.9,
    director: "Halina Reijn",
    cast: ["Nicole Kidman", "Harris Dickinson", "Antonio Banderas"],
    synopsis: "A high-powered CEO puts her career and family on the line when she begins a dangerous affair with her much younger intern.",
    heroImage: "https://images.unsplash.com/photo-1519671282429-b8d1af5c1f76?w=1600&h=900&fit=crop&auto=format",
    posterImage: "https://images.unsplash.com/photo-1519671282429-b8d1af5c1f76?w=400&h=600&fit=crop&auto=format",
    tag: "NOW SHOWING",
  },
];

const SEED_CINEMAS: CinemaType[] = [
  {
    id: 1, name: "Lumière West End", area: "Soho, London",
    address: "34 Old Compton Street, London W1D 4TN",
    screens: 8, seats: 1240, phone: "+44 20 7494 3456",
    features: ["IMAX", "Dolby Atmos", "4DX", "VIP Lounge"],
    image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&h=400&fit=crop&auto=format",
  },
  {
    id: 2, name: "Lumière Canary Wharf", area: "East London",
    address: "1 Canada Square, London E14 5AB",
    screens: 6, seats: 920, phone: "+44 20 7512 7890",
    features: ["IMAX", "Dolby Atmos", "Premium Seating"],
    image: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600&h=400&fit=crop&auto=format",
  },
  {
    id: 3, name: "Lumière Shoreditch", area: "East London",
    address: "7 Curtain Road, London EC2A 3LT",
    screens: 5, seats: 680, phone: "+44 20 7739 2211",
    features: ["Dolby Atmos", "Bar & Kitchen", "Late Night Screenings"],
    image: "https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?w=600&h=400&fit=crop&auto=format",
  },
  {
    id: 4, name: "Lumière Brixton", area: "South London",
    address: "211 Coldharbour Lane, London SW9 8RU",
    screens: 4, seats: 560, phone: "+44 20 7737 5544",
    features: ["Dolby Atmos", "Community Screenings", "Rooftop Bar"],
    image: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=600&h=400&fit=crop&auto=format",
  },
];

const SEED_SHOWS: ShowType[] = [
  { id: 1, filmId: 1, cinemaId: 1, date: "Thu 10", times: ["10:30", "13:15", "18:45", "21:30"], format: "IMAX" },
  { id: 2, filmId: 1, cinemaId: 2, date: "Thu 10", times: ["11:00", "16:00", "21:00"], format: "STANDARD" },
  { id: 3, filmId: 2, cinemaId: 1, date: "Thu 10", times: ["12:00", "17:30", "20:45"], format: "DOLBY ATMOS" },
  { id: 4, filmId: 3, cinemaId: 3, date: "Fri 11", times: ["14:00", "19:15", "22:30"], format: "STANDARD" },
];

const COMING_SOON = [
  { id: 10, title: "Avatar: Fire & Ash", year: 2026, genre: ["Sci-Fi", "Action"], rating: "PG-13", releaseDate: "25 Jul 2026", director: "James Cameron", synopsis: "Jake Sully and Neytiri face a devastating new threat from within Pandora itself.", posterImage: "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=400&h=600&fit=crop&auto=format" },
  { id: 11, title: "Mission: Impossible 8", year: 2026, genre: ["Action", "Thriller"], rating: "PG-13", releaseDate: "8 Aug 2026", director: "Christopher McQuarrie", synopsis: "Ethan Hunt races against time as the Entity evolves beyond all predictions.", posterImage: "https://images.unsplash.com/photo-1608889825205-eebdb9fc5806?w=400&h=600&fit=crop&auto=format" },
  { id: 12, title: "Blade Runner 2099", year: 2026, genre: ["Sci-Fi", "Neo-Noir"], rating: "R", releaseDate: "19 Sep 2026", director: "Ridley Scott", synopsis: "In the smog-choked megacities of 2099, a retired blade runner is pulled back for one final assignment.", posterImage: "https://images.unsplash.com/photo-1517976487492-5750f3195933?w=400&h=600&fit=crop&auto=format" },
  { id: 13, title: "The Electric State", year: 2026, genre: ["Sci-Fi", "Drama"], rating: "PG-13", releaseDate: "3 Oct 2026", director: "The Russo Brothers", synopsis: "A young woman and an outlaw robot travel across a strange retro-future America.", posterImage: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=600&fit=crop&auto=format" },
  { id: 14, title: "Wicked: For Good", year: 2026, genre: ["Musical", "Fantasy"], rating: "PG", releaseDate: "21 Nov 2026", director: "Jon M. Chu", synopsis: "The thrilling conclusion to the story of Elphaba and Glinda.", posterImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&auto=format" },
  { id: 15, title: "Jurassic World: Rebirth", year: 2026, genre: ["Adventure", "Sci-Fi"], rating: "PG-13", releaseDate: "5 Dec 2026", director: "Gareth Edwards", synopsis: "Five years after the fall of Biosyn Valley, a covert mission reveals dinosaurs have evolved.", posterImage: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=600&fit=crop&auto=format" },
];

const MEMBERSHIPS = [
  { id: "essential", name: "Essential", price: 9.99, period: "month", color: "border-border", badge: "", perks: ["2 standard tickets per month", "10% food & drink discount", "No booking fees", "Early access to ticket releases"] },
  { id: "prestige", name: "Prestige", price: 17.99, period: "month", color: "border-primary", badge: "MOST POPULAR", perks: ["4 tickets per month (any format)", "20% food & drink discount", "No booking fees", "Priority seat selection", "Free monthly IMAX upgrade", "Exclusive member screenings"] },
  { id: "lumiere", name: "Lumière", price: 29.99, period: "month", color: "border-accent", badge: "ULTIMATE", perks: ["Unlimited tickets (any format)", "30% food & drink discount", "No booking fees", "VIP lounge access", "Guest pass (2/month)", "Exclusive director Q&As", "Annual gala invitation"] },
];

const DATES = ["Tue 8", "Wed 9", "Thu 10", "Fri 11", "Sat 12", "Sun 13"];
const RATINGS = ["G", "PG", "PG-13", "R", "NC-17"];
const ALL_GENRES = ["Action", "Adventure", "Biopic", "Comedy", "Drama", "Epic", "Fantasy", "Gothic", "Historical", "Horror", "Music", "Musical", "Mystery", "Neo-Noir", "Romance", "Sci-Fi", "Thriller"];
const FORMATS = ["STANDARD", "IMAX", "DOLBY ATMOS", "4DX"];
const ALL_FEATURES = ["IMAX", "Dolby Atmos", "4DX", "VIP Lounge", "Premium Seating", "Bar & Kitchen", "Late Night Screenings", "Community Screenings", "Rooftop Bar"];
const LOCATIONS = ["London, UK", "Manchester, UK", "Birmingham, UK", "Edinburgh, UK", "Glasgow, UK", "Bristol, UK", "Leeds, UK", "Liverpool, UK", "New York, USA", "Los Angeles, USA", "Paris, France", "Berlin, Germany"];

const ADMIN_CREDENTIALS = { username: "admin", password: "lumiere2026" };

type View = "browse" | "coming-soon" | "cinemas" | "memberships" | "showtimes" | "seats" | "confirm";
type AdminTab = "dashboard" | "movies" | "shows" | "theatres" | "location";

interface Booking {
  film: FilmType; date: string; time: string; format: string; seats: string[];
}

function formatDuration(mins: number) {
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

function generateSeatLayout() {
  const rows = ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K"];
  const seatsPerRow = 14;
  const occupied = new Set<string>();
  rows.forEach((row) => {
    for (let s = 1; s <= seatsPerRow; s++) {
      if (Math.random() < 0.35) occupied.add(`${row}${s}`);
    }
  });
  return { rows, seatsPerRow, occupied };
}
const SEAT_LAYOUT = generateSeatLayout();

// ─── Input Component ──────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[11px] text-muted-foreground block mb-1.5 tracking-wider" style={{ fontFamily: "'DM Mono', monospace" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function Input({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full bg-muted border border-border text-foreground px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 transition-colors"
    />
  );
}

function Textarea({ ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className="w-full bg-muted border border-border text-foreground px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 transition-colors resize-none"
    />
  );
}

function Select({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) {
  return (
    <select
      {...props}
      className="w-full bg-muted border border-border text-foreground px-3 py-2.5 text-sm focus:outline-none focus:border-primary/60 transition-colors appearance-none"
    >
      {children}
    </select>
  );
}

// ─── Admin Login ──────────────────────────────────────────────────────────────

function AdminLoginPage({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      onLogin();
    } else {
      setError("Invalid credentials. Use admin / lumiere2026");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 bg-primary/10 border border-primary/30 flex items-center justify-center mb-5">
            <Shield size={24} className="text-primary" />
          </div>
          <h1 className="text-4xl font-black text-foreground uppercase" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
            Admin Portal
          </h1>
          <p className="text-xs text-muted-foreground mt-1" style={{ fontFamily: "'DM Mono', monospace" }}>
            LUMIÈRE CINEMA MANAGEMENT
          </p>
        </div>

        <form onSubmit={handleSubmit} className="border border-border bg-card p-8 space-y-5">
          {error && (
            <div className="flex items-center gap-2 border border-accent/40 bg-accent/10 text-accent px-3 py-2.5 text-xs" style={{ fontFamily: "'DM Mono', monospace" }}>
              <AlertCircle size={13} /> {error}
            </div>
          )}
          <Field label="USERNAME">
            <div className="relative">
              <Shield size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(""); }}
                placeholder="admin"
                required
                className="w-full bg-muted border border-border text-foreground pl-9 pr-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 transition-colors"
              />
            </div>
          </Field>
          <Field label="PASSWORD">
            <div className="relative">
              <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                placeholder="••••••••••"
                required
                className="w-full bg-muted border border-border text-foreground pl-9 pr-10 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 transition-colors"
              />
              <button type="button" onClick={() => setShowPass((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPass ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </div>
          </Field>
          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground font-black py-3 hover:bg-primary/90 transition-colors mt-1 flex items-center justify-center gap-2"
            style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.1em" }}
          >
            <Shield size={16} /> ACCESS ADMIN PANEL
          </button>
          <p className="text-center text-xs text-muted-foreground" style={{ fontFamily: "'DM Mono', monospace" }}>
            Default: admin / lumiere2026
          </p>
        </form>
      </div>
    </div>
  );
}

// ─── Admin Panel ──────────────────────────────────────────────────────────────

function AdminPanel({
  films, setFilms, cinemas, setCinemas, shows, setShows,
  location, setLocation, onExit,
}: {
  films: FilmType[]; setFilms: React.Dispatch<React.SetStateAction<FilmType[]>>;
  cinemas: CinemaType[]; setCinemas: React.Dispatch<React.SetStateAction<CinemaType[]>>;
  shows: ShowType[]; setShows: React.Dispatch<React.SetStateAction<ShowType[]>>;
  location: string; setLocation: (l: string) => void;
  onExit: () => void;
}) {
  const [tab, setTab] = useState<AdminTab>("dashboard");
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const sideItems: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={16} /> },
    { id: "movies", label: "Movies", icon: <Clapperboard size={16} /> },
    { id: "shows", label: "Shows", icon: <MonitorPlay size={16} /> },
    { id: "theatres", label: "Theatres", icon: <Theater size={16} /> },
    { id: "location", label: "Location", icon: <MapPin size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-card border-r border-border flex flex-col">
        <div className="px-5 py-5 border-b border-border">
          <div className="flex items-center gap-2 mb-0.5">
            <Film size={16} className="text-primary" />
            <span className="font-black text-sm text-foreground uppercase tracking-widest" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
              LUMIÈRE
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground" style={{ fontFamily: "'DM Mono', monospace" }}>Admin Panel</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {sideItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-all text-left ${tab === item.id ? "bg-primary/15 text-primary border-l-2 border-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
        <div className="px-3 pb-4 space-y-1">
          <button
            onClick={onExit}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <Globe size={16} /> View Public Site
          </button>
          <button
            onClick={onExit}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-accent hover:bg-accent/10 transition-colors"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-foreground uppercase" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
              {sideItems.find((s) => s.id === tab)?.label}
            </h1>
            <p className="text-xs text-muted-foreground" style={{ fontFamily: "'DM Mono', monospace" }}>
              {location} · Logged in as <span className="text-primary">admin</span>
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs border border-primary/30 bg-primary/10 text-primary px-3 py-1.5" style={{ fontFamily: "'DM Mono', monospace" }}>
            <Shield size={12} /> ADMIN
          </div>
        </header>

        <div className="px-8 py-8">
          {tab === "dashboard" && <AdminDashboard films={films} cinemas={cinemas} shows={shows} location={location} setTab={setTab} />}
          {tab === "movies" && <AdminMovies films={films} setFilms={setFilms} showToast={showToast} />}
          {tab === "shows" && <AdminShows shows={shows} setShows={setShows} films={films} cinemas={cinemas} showToast={showToast} />}
          {tab === "theatres" && <AdminTheatres cinemas={cinemas} setCinemas={setCinemas} showToast={showToast} />}
          {tab === "location" && <AdminLocation location={location} setLocation={setLocation} showToast={showToast} />}
        </div>
      </main>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-card border border-primary/40 text-foreground px-5 py-3 flex items-center gap-2 text-sm z-50">
          <Check size={14} className="text-primary" /> {toast}
        </div>
      )}
    </div>
  );
}

// ─── Admin Dashboard ──────────────────────────────────────────────────────────

function AdminDashboard({ films, cinemas, shows, location, setTab }: {
  films: FilmType[]; cinemas: CinemaType[]; shows: ShowType[]; location: string;
  setTab: (t: AdminTab) => void;
}) {
  const stats = [
    { label: "Total Movies", value: films.length, icon: <Clapperboard size={18} className="text-primary" />, tab: "movies" as AdminTab },
    { label: "Active Shows", value: shows.length, icon: <MonitorPlay size={18} className="text-primary" />, tab: "shows" as AdminTab },
    { label: "Theatres", value: cinemas.length, icon: <Theater size={18} className="text-primary" />, tab: "theatres" as AdminTab },
    { label: "Total Seats", value: cinemas.reduce((a, c) => a + c.seats, 0).toLocaleString(), icon: <Ticket size={18} className="text-primary" />, tab: "theatres" as AdminTab },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <button key={s.label} onClick={() => setTab(s.tab)} className="bg-card border border-border p-5 text-left hover:border-primary/40 transition-colors group">
            <div className="flex items-center justify-between mb-3">
              {s.icon}
              <ChevronRight size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <p className="text-3xl font-black text-foreground" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5" style={{ fontFamily: "'DM Mono', monospace" }}>{s.label}</p>
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-card border border-border p-5">
          <h2 className="text-lg font-black text-foreground uppercase mb-4" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>Recent Films</h2>
          <div className="space-y-3">
            {films.slice(-5).reverse().map((f) => (
              <div key={f.id} className="flex items-center gap-3">
                <img src={f.posterImage} alt={f.title} className="w-8 h-12 object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground truncate" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{f.title}</p>
                  <p className="text-xs text-muted-foreground" style={{ fontFamily: "'DM Mono', monospace" }}>{f.genre.join(", ")} · {f.rating}</p>
                </div>
                <span className="text-[10px] border border-primary/40 text-primary px-1.5 py-0.5 shrink-0" style={{ fontFamily: "'DM Mono', monospace" }}>{f.tag}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border p-5">
          <h2 className="text-lg font-black text-foreground uppercase mb-4" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>Location & Theatres</h2>
          <div className="flex items-center gap-2 border border-primary/30 bg-primary/5 px-3 py-2 mb-4">
            <MapPin size={13} className="text-primary" />
            <span className="text-sm text-primary font-bold" style={{ fontFamily: "'DM Mono', monospace" }}>{location}</span>
          </div>
          <div className="space-y-2">
            {cinemas.map((c) => (
              <div key={c.id} className="flex items-center justify-between text-xs">
                <span className="text-foreground">{c.name}</span>
                <span className="text-muted-foreground" style={{ fontFamily: "'DM Mono', monospace" }}>{c.screens} screens · {c.seats} seats</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Admin Movies ─────────────────────────────────────────────────────────────

function AdminMovies({ films, setFilms, showToast }: {
  films: FilmType[]; setFilms: React.Dispatch<React.SetStateAction<FilmType[]>>; showToast: (m: string) => void;
}) {
  const blank = { title: "", year: new Date().getFullYear(), genre: [] as string[], rating: "PG-13", duration: 120, score: 7.5, director: "", cast: [] as string[], synopsis: "", heroImage: "", posterImage: "", tag: "NOW SHOWING" };
  const [form, setForm] = useState(blank);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [castInput, setCastInput] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const resetForm = () => { setForm(blank); setEditId(null); setCastInput(""); setShowForm(false); };

  const startEdit = (f: FilmType) => {
    setForm({ ...f });
    setCastInput(f.cast.join(", "));
    setEditId(f.id);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cast = castInput.split(",").map((s) => s.trim()).filter(Boolean);
    if (editId !== null) {
      setFilms((prev) => prev.map((f) => f.id === editId ? { ...form, cast, id: editId } : f));
      showToast("Movie updated successfully");
    } else {
      const newId = Math.max(...films.map((f) => f.id), 0) + 1;
      const poster = form.posterImage || `https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=600&fit=crop&auto=format`;
      setFilms((prev) => [...prev, { ...form, cast, id: newId, heroImage: form.heroImage || poster, posterImage: poster }]);
      showToast("Movie added successfully");
    }
    resetForm();
  };

  const handleDelete = (id: number) => {
    setFilms((prev) => prev.filter((f) => f.id !== id));
    setDeleteConfirm(null);
    showToast("Movie deleted");
  };

  const toggleGenre = (g: string) => {
    setForm((f) => ({ ...f, genre: f.genre.includes(g) ? f.genre.filter((x) => x !== g) : [...f.genre, g] }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground" style={{ fontFamily: "'DM Mono', monospace" }}>{films.length} movies in catalogue</p>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="bg-primary text-primary-foreground text-xs font-bold px-4 py-2.5 hover:bg-primary/90 transition-colors flex items-center gap-2"
          style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em" }}
        >
          <Plus size={14} /> ADD MOVIE
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-card border border-border p-6 space-y-5">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-black text-foreground uppercase" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
              {editId ? "Edit Movie" : "Add New Movie"}
            </h2>
            <button type="button" onClick={resetForm} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="TITLE *"><Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Movie title" required /></Field>
            <Field label="DIRECTOR *"><Input value={form.director} onChange={(e) => setForm((f) => ({ ...f, director: e.target.value }))} placeholder="Director name" required /></Field>
            <Field label="YEAR"><Input type="number" value={form.year} onChange={(e) => setForm((f) => ({ ...f, year: +e.target.value }))} /></Field>
            <Field label="DURATION (MINS)"><Input type="number" value={form.duration} onChange={(e) => setForm((f) => ({ ...f, duration: +e.target.value }))} /></Field>
            <Field label="RATING">
              <Select value={form.rating} onChange={(e) => setForm((f) => ({ ...f, rating: e.target.value }))}>
                {RATINGS.map((r) => <option key={r}>{r}</option>)}
              </Select>
            </Field>
            <Field label="SCORE (0–10)"><Input type="number" min="0" max="10" step="0.1" value={form.score} onChange={(e) => setForm((f) => ({ ...f, score: +e.target.value }))} /></Field>
            <Field label="STATUS TAG">
              <Select value={form.tag} onChange={(e) => setForm((f) => ({ ...f, tag: e.target.value }))}>
                {["NOW SHOWING", "COMING SOON", "AWARD WINNER", "PALME D'OR", "LIMITED RUN"].map((t) => <option key={t}>{t}</option>)}
              </Select>
            </Field>
            <Field label="CAST (comma-separated)"><Input value={castInput} onChange={(e) => setCastInput(e.target.value)} placeholder="Actor One, Actor Two, Actor Three" /></Field>
          </div>
          <Field label="SYNOPSIS">
            <Textarea value={form.synopsis} onChange={(e) => setForm((f) => ({ ...f, synopsis: e.target.value }))} rows={3} placeholder="Brief synopsis..." />
          </Field>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="POSTER IMAGE URL"><Input value={form.posterImage} onChange={(e) => setForm((f) => ({ ...f, posterImage: e.target.value }))} placeholder="https://..." /></Field>
            <Field label="HERO IMAGE URL"><Input value={form.heroImage} onChange={(e) => setForm((f) => ({ ...f, heroImage: e.target.value }))} placeholder="https://..." /></Field>
          </div>
          <Field label="GENRES">
            <div className="flex flex-wrap gap-2 mt-1">
              {ALL_GENRES.map((g) => (
                <button
                  type="button" key={g}
                  onClick={() => toggleGenre(g)}
                  className={`text-xs px-2.5 py-1 border transition-all ${form.genre.includes(g) ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-foreground/20"}`}
                  style={{ fontFamily: "'DM Mono', monospace" }}
                >
                  {g}
                </button>
              ))}
            </div>
          </Field>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="bg-primary text-primary-foreground font-bold px-6 py-2.5 hover:bg-primary/90 transition-colors flex items-center gap-2 text-sm" style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em" }}>
              <Save size={14} /> {editId ? "SAVE CHANGES" : "ADD MOVIE"}
            </button>
            <button type="button" onClick={resetForm} className="border border-border text-muted-foreground px-6 py-2.5 text-sm hover:text-foreground transition-colors">Cancel</button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {films.map((film) => (
          <div key={film.id} className="bg-card border border-border flex items-center gap-4 p-4 hover:border-border/60 transition-colors">
            <img src={film.posterImage} alt={film.title} className="w-10 h-14 object-cover shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-black text-foreground uppercase" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{film.title}</h3>
                <span className="text-[10px] border border-primary/40 text-primary px-1.5 py-0.5" style={{ fontFamily: "'DM Mono', monospace" }}>{film.tag}</span>
              </div>
              <p className="text-xs text-muted-foreground" style={{ fontFamily: "'DM Mono', monospace" }}>
                {film.director} · {film.rating} · {formatDuration(film.duration)} · ★{film.score} · {film.genre.join(", ")}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => startEdit(film)} className="p-2 text-muted-foreground hover:text-primary transition-colors border border-border hover:border-primary/40">
                <Edit3 size={14} />
              </button>
              {deleteConfirm === film.id ? (
                <div className="flex items-center gap-1">
                  <button onClick={() => handleDelete(film.id)} className="px-3 py-1.5 bg-accent text-accent-foreground text-xs font-bold hover:bg-accent/80 transition-colors">Confirm</button>
                  <button onClick={() => setDeleteConfirm(null)} className="px-3 py-1.5 border border-border text-xs text-muted-foreground hover:text-foreground">Cancel</button>
                </div>
              ) : (
                <button onClick={() => setDeleteConfirm(film.id)} className="p-2 text-muted-foreground hover:text-accent transition-colors border border-border hover:border-accent/40">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Admin Shows ──────────────────────────────────────────────────────────────

function AdminShows({ shows, setShows, films, cinemas, showToast }: {
  shows: ShowType[]; setShows: React.Dispatch<React.SetStateAction<ShowType[]>>;
  films: FilmType[]; cinemas: CinemaType[]; showToast: (m: string) => void;
}) {
  const blank = { filmId: films[0]?.id ?? 0, cinemaId: cinemas[0]?.id ?? 0, date: DATES[0], times: ["18:00"], format: "STANDARD" };
  const [form, setForm] = useState(blank);
  const [timeInput, setTimeInput] = useState("18:00");
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const times = timeInput.split(",").map((t) => t.trim()).filter(Boolean);
    const newId = Math.max(...shows.map((s) => s.id), 0) + 1;
    setShows((prev) => [...prev, { ...form, times, id: newId }]);
    showToast("Show schedule added");
    setShowForm(false);
    setForm(blank);
    setTimeInput("18:00");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground" style={{ fontFamily: "'DM Mono', monospace" }}>{shows.length} show schedules</p>
        <button onClick={() => setShowForm(true)} className="bg-primary text-primary-foreground text-xs font-bold px-4 py-2.5 hover:bg-primary/90 transition-colors flex items-center gap-2" style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em" }}>
          <Plus size={14} /> ADD SHOW
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-card border border-border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-foreground uppercase" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>Add Show Schedule</h2>
            <button type="button" onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="MOVIE">
              <Select value={form.filmId} onChange={(e) => setForm((f) => ({ ...f, filmId: +e.target.value }))}>
                {films.map((f) => <option key={f.id} value={f.id}>{f.title}</option>)}
              </Select>
            </Field>
            <Field label="THEATRE">
              <Select value={form.cinemaId} onChange={(e) => setForm((f) => ({ ...f, cinemaId: +e.target.value }))}>
                {cinemas.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </Field>
            <Field label="DATE">
              <Select value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}>
                {DATES.map((d) => <option key={d}>{d}</option>)}
              </Select>
            </Field>
            <Field label="FORMAT">
              <Select value={form.format} onChange={(e) => setForm((f) => ({ ...f, format: e.target.value }))}>
                {FORMATS.map((fmt) => <option key={fmt}>{fmt}</option>)}
              </Select>
            </Field>
            <Field label="SHOWTIMES (comma-separated, e.g. 10:30, 14:00, 19:45)" >
              <Input value={timeInput} onChange={(e) => setTimeInput(e.target.value)} placeholder="10:30, 14:00, 19:45, 22:00" />
            </Field>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="submit" className="bg-primary text-primary-foreground font-bold px-6 py-2.5 hover:bg-primary/90 transition-colors flex items-center gap-2 text-sm" style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em" }}>
              <Save size={14} /> ADD SHOW
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="border border-border text-muted-foreground px-6 py-2.5 text-sm hover:text-foreground transition-colors">Cancel</button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {shows.map((show) => {
          const film = films.find((f) => f.id === show.filmId);
          const cinema = cinemas.find((c) => c.id === show.cinemaId);
          return (
            <div key={show.id} className="bg-card border border-border p-4 flex items-center gap-4">
              <MonitorPlay size={18} className="text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-foreground uppercase" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                  {film?.title ?? "Unknown"} <span className="text-muted-foreground font-normal">at</span> {cinema?.name ?? "Unknown"}
                </p>
                <p className="text-xs text-muted-foreground" style={{ fontFamily: "'DM Mono', monospace" }}>
                  {show.date} · {show.format} · {show.times.join(", ")}
                </p>
              </div>
              {deleteConfirm === show.id ? (
                <div className="flex items-center gap-1">
                  <button onClick={() => { setShows((p) => p.filter((s) => s.id !== show.id)); setDeleteConfirm(null); showToast("Show removed"); }} className="px-3 py-1.5 bg-accent text-accent-foreground text-xs font-bold hover:bg-accent/80">Confirm</button>
                  <button onClick={() => setDeleteConfirm(null)} className="px-3 py-1.5 border border-border text-xs text-muted-foreground">Cancel</button>
                </div>
              ) : (
                <button onClick={() => setDeleteConfirm(show.id)} className="p-2 text-muted-foreground hover:text-accent border border-border hover:border-accent/40 transition-colors">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          );
        })}
        {shows.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm border border-border border-dashed">No show schedules yet. Add one above.</div>
        )}
      </div>
    </div>
  );
}

// ─── Admin Theatres ───────────────────────────────────────────────────────────

function AdminTheatres({ cinemas, setCinemas, showToast }: {
  cinemas: CinemaType[]; setCinemas: React.Dispatch<React.SetStateAction<CinemaType[]>>; showToast: (m: string) => void;
}) {
  const blank = { name: "", area: "", address: "", screens: 4, seats: 400, phone: "", features: [] as string[], image: "" };
  const [form, setForm] = useState(blank);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const resetForm = () => { setForm(blank); setEditId(null); setShowForm(false); };

  const startEdit = (c: CinemaType) => {
    setForm({ name: c.name, area: c.area, address: c.address, screens: c.screens, seats: c.seats, phone: c.phone, features: [...c.features], image: c.image });
    setEditId(c.id);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editId !== null) {
      setCinemas((prev) => prev.map((c) => c.id === editId ? { ...form, id: editId } : c));
      showToast("Theatre updated");
    } else {
      const newId = Math.max(...cinemas.map((c) => c.id), 0) + 1;
      const img = form.image || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&h=400&fit=crop&auto=format";
      setCinemas((prev) => [...prev, { ...form, id: newId, image: img }]);
      showToast("Theatre added");
    }
    resetForm();
  };

  const toggleFeature = (feat: string) => {
    setForm((f) => ({ ...f, features: f.features.includes(feat) ? f.features.filter((x) => x !== feat) : [...f.features, feat] }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground" style={{ fontFamily: "'DM Mono', monospace" }}>{cinemas.length} theatres</p>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="bg-primary text-primary-foreground text-xs font-bold px-4 py-2.5 hover:bg-primary/90 transition-colors flex items-center gap-2" style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em" }}>
          <Plus size={14} /> ADD THEATRE
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-card border border-border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-foreground uppercase" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
              {editId ? "Edit Theatre" : "Add Theatre"}
            </h2>
            <button type="button" onClick={resetForm} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="CINEMA NAME *"><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Lumière West End" required /></Field>
            <Field label="AREA / DISTRICT *"><Input value={form.area} onChange={(e) => setForm((f) => ({ ...f, area: e.target.value }))} placeholder="e.g. Soho, London" required /></Field>
            <Field label="FULL ADDRESS"><Input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} placeholder="Street, City, Postcode" /></Field>
            <Field label="PHONE"><Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+44 20 XXXX XXXX" /></Field>
            <Field label="NUMBER OF SCREENS"><Input type="number" min="1" value={form.screens} onChange={(e) => setForm((f) => ({ ...f, screens: +e.target.value }))} /></Field>
            <Field label="TOTAL SEATS"><Input type="number" min="1" value={form.seats} onChange={(e) => setForm((f) => ({ ...f, seats: +e.target.value }))} /></Field>
            <Field label="IMAGE URL (optional)"><Input value={form.image} onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))} placeholder="https://..." /></Field>
          </div>
          <Field label="FEATURES">
            <div className="flex flex-wrap gap-2 mt-1">
              {ALL_FEATURES.map((feat) => (
                <button type="button" key={feat} onClick={() => toggleFeature(feat)}
                  className={`text-xs px-2.5 py-1 border transition-all ${form.features.includes(feat) ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-foreground/20"}`}
                  style={{ fontFamily: "'DM Mono', monospace" }}>
                  {feat}
                </button>
              ))}
            </div>
          </Field>
          <div className="flex gap-3 pt-1">
            <button type="submit" className="bg-primary text-primary-foreground font-bold px-6 py-2.5 hover:bg-primary/90 transition-colors flex items-center gap-2 text-sm" style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em" }}>
              <Save size={14} /> {editId ? "SAVE CHANGES" : "ADD THEATRE"}
            </button>
            <button type="button" onClick={resetForm} className="border border-border text-muted-foreground px-6 py-2.5 text-sm hover:text-foreground transition-colors">Cancel</button>
          </div>
        </form>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {cinemas.map((c) => (
          <div key={c.id} className="bg-card border border-border overflow-hidden">
            <div className="relative h-32 bg-muted">
              <img src={c.image} alt={c.name} className="w-full h-full object-cover opacity-70" />
              <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
              <div className="absolute bottom-3 left-4">
                <p className="text-xs text-muted-foreground" style={{ fontFamily: "'DM Mono', monospace" }}>{c.area}</p>
                <h3 className="text-lg font-black text-foreground uppercase" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{c.name}</h3>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3" style={{ fontFamily: "'DM Mono', monospace" }}>
                <span>{c.screens} screens</span><span>·</span><span>{c.seats} seats</span>
                {c.address && <><span>·</span><span className="truncate">{c.address.split(",")[0]}</span></>}
              </div>
              <div className="flex flex-wrap gap-1 mb-4">
                {c.features.map((feat) => (
                  <span key={feat} className="text-[10px] border border-border text-muted-foreground px-1.5 py-0.5" style={{ fontFamily: "'DM Mono', monospace" }}>{feat}</span>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(c)} className="flex-1 border border-border text-muted-foreground text-xs py-2 hover:border-primary/40 hover:text-primary transition-colors flex items-center justify-center gap-1.5">
                  <Edit3 size={12} /> Edit
                </button>
                {deleteConfirm === c.id ? (
                  <div className="flex gap-1 flex-1">
                    <button onClick={() => { setCinemas((p) => p.filter((x) => x.id !== c.id)); setDeleteConfirm(null); showToast("Theatre removed"); }} className="flex-1 bg-accent text-accent-foreground text-xs py-2 font-bold hover:bg-accent/80">Confirm</button>
                    <button onClick={() => setDeleteConfirm(null)} className="flex-1 border border-border text-xs text-muted-foreground py-2">Cancel</button>
                  </div>
                ) : (
                  <button onClick={() => setDeleteConfirm(c.id)} className="flex-1 border border-border text-muted-foreground text-xs py-2 hover:border-accent/40 hover:text-accent transition-colors flex items-center justify-center gap-1.5">
                    <Trash2 size={12} /> Remove
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Admin Location ───────────────────────────────────────────────────────────

function AdminLocation({ location, setLocation, showToast }: {
  location: string; setLocation: (l: string) => void; showToast: (m: string) => void;
}) {
  const [selected, setSelected] = useState(location);
  const [custom, setCustom] = useState("");
  const [useCustom, setUseCustom] = useState(false);

  const handleSave = () => {
    const loc = useCustom ? custom.trim() : selected;
    if (!loc) return;
    setLocation(loc);
    showToast(`Location updated to ${loc}`);
  };

  return (
    <div className="max-w-xl space-y-6">
      <div className="bg-card border border-border p-6 space-y-5">
        <div className="flex items-center gap-3 p-4 border border-primary/30 bg-primary/5">
          <MapPin size={18} className="text-primary" />
          <div>
            <p className="text-xs text-muted-foreground" style={{ fontFamily: "'DM Mono', monospace" }}>CURRENT LOCATION</p>
            <p className="text-xl font-black text-foreground" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{location}</p>
          </div>
        </div>

        <Field label="SELECT A PRESET LOCATION">
          <div className="grid grid-cols-2 gap-2 mt-1">
            {LOCATIONS.map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => { setSelected(loc); setUseCustom(false); }}
                className={`text-left px-3 py-2.5 text-xs border transition-all ${!useCustom && selected === loc ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground"}`}
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                <MapPin size={10} className="inline mr-1.5 opacity-70" />
                {loc}
              </button>
            ))}
          </div>
        </Field>

        <div className="border-t border-border pt-4">
          <button
            type="button"
            onClick={() => setUseCustom((v) => !v)}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors mb-3"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            <ChevronDown size={12} className={`transition-transform ${useCustom ? "rotate-180" : ""}`} />
            {useCustom ? "Hide" : "Enter"} custom location
          </button>
          {useCustom && (
            <Field label="CUSTOM LOCATION">
              <Input value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="e.g. Tokyo, Japan" />
            </Field>
          )}
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-primary text-primary-foreground font-black py-3 hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.1em" }}
        >
          <Save size={16} /> SAVE LOCATION
        </button>
      </div>

      <div className="bg-card border border-border p-5">
        <h3 className="text-sm font-black text-foreground uppercase mb-3" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>About Location Settings</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          The location setting controls which cinemas are shown on the public site nav bar and cinema finder. Changing this will update the displayed location for all users browsing the public site in real time.
        </p>
      </div>
    </div>
  );
}

// ─── Sign In Modal ────────────────────────────────────────────────────────────

function SignInModal({ onClose, onSignedIn }: { onClose: () => void; onSignedIn: (name: string) => void }) {
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSignedIn(tab === "signup" ? name || "Member" : email.split("@")[0] || "Member");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md mx-4 bg-card border border-border">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex gap-1">
            {(["signin", "signup"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-4 py-1.5 text-xs font-bold transition-all ${tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em" }}>
                {t === "signin" ? "SIGN IN" : "CREATE ACCOUNT"}
              </button>
            ))}
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {tab === "signup" && (
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5" style={{ fontFamily: "'DM Mono', monospace" }}>FULL NAME</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="w-full bg-input-background border border-border text-foreground px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 transition-colors" />
            </div>
          )}
          <div>
            <label className="text-xs text-muted-foreground block mb-1.5" style={{ fontFamily: "'DM Mono', monospace" }}>EMAIL</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="w-full bg-input-background border border-border text-foreground pl-9 pr-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 transition-colors" />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1.5" style={{ fontFamily: "'DM Mono', monospace" }}>PASSWORD</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="w-full bg-input-background border border-border text-foreground pl-9 pr-10 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 transition-colors" />
              <button type="button" onClick={() => setShowPass((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
          <button type="submit" className="w-full bg-primary text-primary-foreground font-bold py-3 hover:bg-primary/90 transition-colors" style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.1em" }}>
            {tab === "signin" ? "SIGN IN" : "CREATE ACCOUNT"}
          </button>
          <div className="relative flex items-center gap-3 py-1">
            <div className="flex-1 border-t border-border" />
            <span className="text-xs text-muted-foreground" style={{ fontFamily: "'DM Mono', monospace" }}>or</span>
            <div className="flex-1 border-t border-border" />
          </div>
          <button type="button" className="w-full border border-border text-foreground text-sm py-3 hover:border-foreground/20 transition-colors flex items-center justify-center gap-2">
            <Globe size={14} /> Continue with Google
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Nav ──────────────────────────────────────────────────────────────────────

function Nav({ activeView, onNav, onSignIn, user, onSignOut, location, onAdminClick }: {
  activeView: View; onNav: (v: View) => void; onSignIn: () => void;
  user: string | null; onSignOut: () => void; location: string; onAdminClick: () => void;
}) {
  const navItems: { label: string; view: View }[] = [
    { label: "Now Showing", view: "browse" },
    { label: "Coming Soon", view: "coming-soon" },
    { label: "Cinemas", view: "cinemas" },
    { label: "Memberships", view: "memberships" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 h-16 border-b border-border bg-background/90 backdrop-blur-md">
      <button onClick={() => onNav("browse")} className="flex items-center gap-2">
        <Film size={20} className="text-primary" />
        <span className="font-bold text-xl tracking-widest text-foreground uppercase" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>LUMIÈRE</span>
      </button>
      <div className="hidden md:flex items-center gap-6 text-sm">
        {navItems.map(({ label, view }) => (
          <button key={view} onClick={() => onNav(view)}
            className={`transition-colors relative pb-0.5 ${activeView === view ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
            {label}
            {activeView === view && <span className="absolute bottom-0 left-0 right-0 h-px bg-primary" />}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <button className="p-2 text-muted-foreground hover:text-foreground transition-colors"><Search size={18} /></button>
        <button className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground border border-border px-3 py-1.5 hover:border-primary/50 transition-colors">
          <MapPin size={12} />{location}
        </button>
        <button onClick={onAdminClick} className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground border border-border px-3 py-1.5 hover:border-primary/50 hover:text-primary transition-colors" title="Admin Panel">
          <Shield size={12} /> Admin
        </button>
        {user ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-primary font-bold hidden md:block" style={{ fontFamily: "'DM Mono', monospace" }}>{user}</span>
            <button onClick={onSignOut} className="border border-border text-muted-foreground text-xs px-3 py-2 hover:text-foreground transition-colors">Sign Out</button>
          </div>
        ) : (
          <button onClick={onSignIn} className="bg-primary text-primary-foreground text-xs font-semibold px-4 py-2 hover:bg-primary/90 transition-colors">Sign In</button>
        )}
      </div>
    </nav>
  );
}

// ─── Public Views ─────────────────────────────────────────────────────────────

function BrowseView({ films, onSelect }: { films: FilmType[]; onSelect: (film: FilmType) => void }) {
  const hero = films[0];
  const [activeGenre, setActiveGenre] = useState("All");
  if (!hero) return <div className="min-h-screen pt-16 flex items-center justify-center text-muted-foreground">No movies available.</div>;
  const genres = ["All", ...Array.from(new Set(films.flatMap((f) => f.genre)))];
  const filtered = activeGenre === "All" ? films : films.filter((f) => f.genre.includes(activeGenre));

  return (
    <div className="min-h-screen bg-background">
      <div className="relative h-[90vh] overflow-hidden">
        <img src={hero.heroImage} alt={hero.title} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        <div className="relative h-full flex items-center pt-16">
          <div className="px-6 md:px-16 max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-bold tracking-widest text-primary border border-primary/40 px-2 py-0.5" style={{ fontFamily: "'DM Mono', monospace" }}>{hero.tag}</span>
              <span className="text-xs text-muted-foreground" style={{ fontFamily: "'DM Mono', monospace" }}>{hero.rating} · {formatDuration(hero.duration)}</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-foreground leading-none mb-4 uppercase" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{hero.title}</h1>
            <p className="text-sm text-muted-foreground mb-2">Directed by {hero.director}</p>
            <div className="flex items-center gap-1.5 mb-6">
              <Star size={14} className="fill-primary text-primary" />
              <span className="text-primary font-semibold text-sm" style={{ fontFamily: "'DM Mono', monospace" }}>{hero.score}</span>
              <span className="text-muted-foreground text-xs ml-1">· {hero.genre.join(", ")}</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-8 max-w-md">{hero.synopsis}</p>
            <div className="flex items-center gap-3">
              <button onClick={() => onSelect(hero)} className="bg-primary text-primary-foreground font-bold text-sm px-8 py-3 hover:bg-primary/90 active:scale-95 transition-all flex items-center gap-2" style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em" }}>
                <Ticket size={16} /> BOOK TICKETS
              </button>
              <button className="border border-border text-foreground text-sm px-6 py-3 hover:border-foreground/30 transition-colors">Watch Trailer</button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-8 right-8 hidden lg:flex gap-3">
          {films.slice(1, 4).map((f) => (
            <button key={f.id} onClick={() => onSelect(f)} className="relative group overflow-hidden">
              <img src={f.posterImage} alt={f.title} className="w-20 h-28 object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-0 border border-border group-hover:border-primary/50 transition-colors" />
            </button>
          ))}
        </div>
      </div>
      <div className="px-6 md:px-16 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <h2 className="text-4xl font-black text-foreground uppercase" style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.04em" }}>Now Showing</h2>
          <div className="flex flex-wrap gap-2">
            {genres.map((g) => (
              <button key={g} onClick={() => setActiveGenre(g)}
                className={`text-xs px-3 py-1.5 border transition-all ${activeGenre === g ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground"}`}
                style={{ fontFamily: "'DM Mono', monospace" }}>{g}</button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {filtered.map((film) => (
            <button key={film.id} onClick={() => onSelect(film)} className="group text-left relative overflow-hidden">
              <div className="relative overflow-hidden aspect-[2/3] bg-muted">
                <img src={film.posterImage} alt={film.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-2 left-2">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 bg-primary text-primary-foreground" style={{ fontFamily: "'DM Mono', monospace" }}>{film.tag}</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="bg-primary text-primary-foreground text-xs font-bold text-center py-2">BOOK NOW</div>
                </div>
              </div>
              <div className="pt-3">
                <h3 className="text-sm font-bold text-foreground uppercase leading-tight mb-1" style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.04em" }}>{film.title}</h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground" style={{ fontFamily: "'DM Mono', monospace" }}>
                  <span className="flex items-center gap-0.5"><Star size={10} className="fill-primary text-primary" />{film.score}</span>
                  <span>·</span><span>{film.rating}</span><span>·</span><span>{formatDuration(film.duration)}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ComingSoonView() {
  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="px-6 md:px-16 py-12">
        <p className="text-xs text-muted-foreground mb-2" style={{ fontFamily: "'DM Mono', monospace" }}>UPCOMING RELEASES</p>
        <h1 className="text-5xl font-black text-foreground uppercase mb-10" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>Coming Soon</h1>
        <div className="space-y-px">
          {COMING_SOON.map((film, i) => (
            <div key={film.id} className="group flex gap-6 items-center border-t border-border py-6 hover:bg-muted/30 px-4 -mx-4 transition-colors">
              <span className="text-4xl font-black text-muted/30 w-10 shrink-0 text-center" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{String(i + 1).padStart(2, "0")}</span>
              <div className="w-16 shrink-0"><img src={film.posterImage} alt={film.title} className="w-full aspect-[2/3] object-cover" /></div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h2 className="text-2xl font-black text-foreground uppercase" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{film.title}</h2>
                  {film.genre.map((g) => <span key={g} className="text-[10px] border border-border text-muted-foreground px-1.5 py-0.5" style={{ fontFamily: "'DM Mono', monospace" }}>{g}</span>)}
                </div>
                <p className="text-xs text-muted-foreground mb-1" style={{ fontFamily: "'DM Mono', monospace" }}>Dir. {film.director} · {film.rating}</p>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xl hidden md:block">{film.synopsis}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-xs text-muted-foreground mb-1" style={{ fontFamily: "'DM Mono', monospace" }}>RELEASE</p>
                <p className="text-lg font-black text-foreground" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{film.releaseDate}</p>
                <button className="mt-3 border border-border text-xs text-muted-foreground px-4 py-1.5 hover:border-primary hover:text-primary transition-colors" style={{ fontFamily: "'DM Mono', monospace" }}>REMIND ME</button>
              </div>
            </div>
          ))}
          <div className="border-t border-border" />
        </div>
      </div>
    </div>
  );
}

function CinemasView({ cinemas }: { cinemas: CinemaType[] }) {
  const [selected, setSelected] = useState<number | null>(null);
  const cinema = cinemas.find((c) => c.id === selected);
  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="px-6 md:px-16 py-12">
        <p className="text-xs text-muted-foreground mb-2" style={{ fontFamily: "'DM Mono', monospace" }}>FIND A CINEMA</p>
        <h1 className="text-5xl font-black text-foreground uppercase mb-10" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>Our Cinemas</h1>
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {cinemas.map((c) => (
            <button key={c.id} onClick={() => setSelected(selected === c.id ? null : c.id)}
              className={`group text-left border transition-all overflow-hidden ${selected === c.id ? "border-primary" : "border-border hover:border-foreground/20"}`}>
              <div className="relative h-40 bg-muted overflow-hidden">
                <img src={c.image} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                <div className="absolute bottom-3 left-4">
                  <p className="text-xs text-muted-foreground" style={{ fontFamily: "'DM Mono', monospace" }}>{c.area}</p>
                  <h3 className="text-xl font-black text-foreground uppercase" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{c.name}</h3>
                </div>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div className="flex gap-4 text-xs text-muted-foreground" style={{ fontFamily: "'DM Mono', monospace" }}>
                  <span>{c.screens} screens</span><span>·</span><span>{c.seats} seats</span>
                </div>
                <div className="flex gap-1.5 flex-wrap justify-end">
                  {c.features.slice(0, 2).map((f) => <span key={f} className="text-[10px] px-1.5 py-0.5 border border-border text-muted-foreground" style={{ fontFamily: "'DM Mono', monospace" }}>{f}</span>)}
                </div>
              </div>
            </button>
          ))}
        </div>
        {cinema && (
          <div className="border border-primary/30 bg-primary/5 p-6">
            <div className="flex flex-wrap gap-6 items-start">
              <Building2 size={32} className="text-primary shrink-0 mt-1" />
              <div className="flex-1 min-w-0">
                <h2 className="text-3xl font-black text-foreground uppercase mb-1" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{cinema.name}</h2>
                <div className="flex flex-col gap-2 text-sm text-muted-foreground mt-3">
                  <span className="flex items-center gap-2"><Navigation size={13} className="text-primary" />{cinema.address}</span>
                  <span className="flex items-center gap-2"><Phone size={13} className="text-primary" />{cinema.phone}</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  {cinema.features.map((f) => <span key={f} className="text-xs border border-primary/40 text-primary px-2 py-1" style={{ fontFamily: "'DM Mono', monospace" }}>{f}</span>)}
                </div>
              </div>
              <button className="bg-primary text-primary-foreground font-bold text-sm px-6 py-3 hover:bg-primary/90 transition-colors" style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em" }}>GET DIRECTIONS</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MembershipsView({ onSignIn }: { onSignIn: () => void }) {
  const [selected, setSelected] = useState("prestige");
  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="px-6 md:px-16 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs text-muted-foreground mb-2" style={{ fontFamily: "'DM Mono', monospace" }}>MEMBERSHIP PLANS</p>
            <h1 className="text-5xl font-black text-foreground uppercase mb-4" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>Join Lumière</h1>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">Unlimited cinema. No compromises.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4 mb-10">
            {MEMBERSHIPS.map((m) => (
              <button key={m.id} onClick={() => setSelected(m.id)} className={`text-left border transition-all p-6 relative ${selected === m.id ? `${m.color} bg-primary/5` : "border-border hover:border-foreground/20"}`}>
                {m.badge && <div className="absolute -top-3 left-4"><span className={`text-[10px] font-bold px-2 py-0.5 ${m.id === "lumiere" ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground"}`} style={{ fontFamily: "'DM Mono', monospace" }}>{m.badge}</span></div>}
                <Crown size={20} className={`mb-4 ${selected === m.id ? "text-primary" : "text-muted-foreground"}`} />
                <h3 className="text-2xl font-black text-foreground uppercase mb-1" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{m.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-black text-foreground" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>£{m.price}</span>
                  <span className="text-xs text-muted-foreground" style={{ fontFamily: "'DM Mono', monospace" }}>/{m.period}</span>
                </div>
                <ul className="space-y-2">
                  {m.perks.map((p) => <li key={p} className="flex items-start gap-2 text-xs text-muted-foreground"><Check size={12} className="text-primary shrink-0 mt-0.5" />{p}</li>)}
                </ul>
              </button>
            ))}
          </div>
          <div className="text-center">
            <button onClick={onSignIn} className="bg-primary text-primary-foreground font-black text-sm px-12 py-4 hover:bg-primary/90 transition-colors inline-flex items-center gap-2" style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.1em" }}>
              <Popcorn size={18} /> GET STARTED — £{MEMBERSHIPS.find((m) => m.id === selected)?.price}/mo
            </button>
            <p className="text-xs text-muted-foreground mt-3" style={{ fontFamily: "'DM Mono', monospace" }}>Cancel anytime · No minimum term</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ShowtimesView({ film, onBack, onSelect }: { film: FilmType; onBack: () => void; onSelect: (date: string, time: string, format: string) => void }) {
  const [selectedDate, setSelectedDate] = useState(DATES[2]);
  const [selectedFormat, setSelectedFormat] = useState("standard");
  const formats = [{ key: "standard", label: "STANDARD", price: 14.5 }, { key: "imax", label: "IMAX", price: 22.0 }, { key: "dolbyAtmos", label: "DOLBY ATMOS", price: 19.5 }];
  const SHOWTIMES_MAP: Record<string, string[]> = { standard: ["10:30", "13:15", "16:00", "18:45", "21:30"], imax: ["11:00", "14:30", "19:15", "22:00"], dolbyAtmos: ["12:00", "17:30", "20:45"] };
  const times = SHOWTIMES_MAP[selectedFormat];
  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="relative h-64 overflow-hidden">
        <img src={film.heroImage} alt={film.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 to-background" />
        <button onClick={onBack} className="absolute top-4 left-6 flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors" style={{ fontFamily: "'DM Mono', monospace" }}><ArrowLeft size={14} /> Back</button>
      </div>
      <div className="px-6 md:px-16 -mt-12 relative">
        <div className="flex gap-6 items-start mb-10">
          <div className="hidden md:block w-28 shrink-0"><img src={film.posterImage} alt={film.title} className="w-full aspect-[2/3] object-cover border border-border" /></div>
          <div>
            <div className="flex items-center gap-2 mb-2">{film.genre.map((g) => <span key={g} className="text-xs border border-border text-muted-foreground px-2 py-0.5" style={{ fontFamily: "'DM Mono', monospace" }}>{g}</span>)}</div>
            <h1 className="text-4xl md:text-6xl font-black text-foreground uppercase leading-none mb-2" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{film.title}</h1>
            <div className="flex items-center gap-3 text-xs text-muted-foreground" style={{ fontFamily: "'DM Mono', monospace" }}>
              <span className="flex items-center gap-1"><Star size={12} className="fill-primary text-primary" />{film.score}</span>
              <span>·</span><span>{film.rating}</span><span>·</span><span className="flex items-center gap-1"><Clock size={12} />{formatDuration(film.duration)}</span>
            </div>
          </div>
        </div>
        <div className="mb-8">
          <h2 className="text-xs text-muted-foreground mb-3 flex items-center gap-2" style={{ fontFamily: "'DM Mono', monospace" }}><Calendar size={12} /> SELECT DATE</h2>
          <div className="flex gap-2 flex-wrap">
            {DATES.map((d) => <button key={d} onClick={() => setSelectedDate(d)} className={`px-4 py-2 text-sm border transition-all ${selectedDate === d ? "bg-primary text-primary-foreground border-primary font-bold" : "border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground"}`} style={{ fontFamily: "'DM Mono', monospace" }}>{d}</button>)}
          </div>
        </div>
        <div className="mb-8">
          <h2 className="text-xs text-muted-foreground mb-3" style={{ fontFamily: "'DM Mono', monospace" }}>SELECT FORMAT</h2>
          <div className="flex gap-3 flex-wrap">
            {formats.map((f) => (
              <button key={f.key} onClick={() => setSelectedFormat(f.key)} className={`px-5 py-3 border transition-all flex flex-col items-start gap-0.5 ${selectedFormat === f.key ? "border-primary bg-primary/10" : "border-border hover:border-foreground/20"}`}>
                <span className={`text-xs font-bold ${selectedFormat === f.key ? "text-primary" : "text-foreground"}`} style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em" }}>{f.label}</span>
                <span className="text-xs text-muted-foreground" style={{ fontFamily: "'DM Mono', monospace" }}>from £{f.price.toFixed(2)}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="mb-12">
          <h2 className="text-xs text-muted-foreground mb-3" style={{ fontFamily: "'DM Mono', monospace" }}>SHOWTIMES — {selectedDate.toUpperCase()} · {formats.find((f) => f.key === selectedFormat)?.label}</h2>
          <div className="flex gap-3 flex-wrap">
            {times.map((t) => (
              <button key={t} onClick={() => onSelect(selectedDate, t, formats.find((f) => f.key === selectedFormat)?.label ?? "")} className="group border border-border text-foreground px-6 py-3 hover:border-primary hover:bg-primary/5 transition-all flex items-center gap-2">
                <span className="text-sm font-bold group-hover:text-primary transition-colors" style={{ fontFamily: "'DM Mono', monospace" }}>{t}</span>
                <ChevronRight size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SeatsView({ booking, onBack, onConfirm }: { booking: Omit<Booking, "seats">; onBack: () => void; onConfirm: (seats: string[]) => void }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const { rows, seatsPerRow, occupied } = SEAT_LAYOUT;
  const toggleSeat = useCallback((id: string) => {
    if (occupied.has(id)) return;
    setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.size < 8 && n.add(id); return n; });
  }, [occupied]);
  const PRICES: Record<string, number> = { STANDARD: 14.5, IMAX: 22.0, "DOLBY ATMOS": 19.5 };
  const total = selected.size * (PRICES[booking.format] ?? 14.5);
  return (
    <div className="min-h-screen bg-background pt-16 pb-40">
      <div className="px-6 md:px-16 py-8">
        <button onClick={onBack} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors mb-6" style={{ fontFamily: "'DM Mono', monospace" }}><ArrowLeft size={14} /> Back to showtimes</button>
        <h1 className="text-3xl font-black text-foreground uppercase mb-1" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{booking.film.title}</h1>
        <p className="text-xs text-muted-foreground mb-8" style={{ fontFamily: "'DM Mono', monospace" }}>{booking.date} · {booking.time} · {booking.format}</p>
        <div className="relative mb-10">
          <div className="mx-auto w-4/5 h-2 bg-gradient-to-r from-transparent via-primary/40 to-transparent mb-1" />
          <p className="text-center text-xs text-muted-foreground tracking-widest" style={{ fontFamily: "'DM Mono', monospace" }}>SCREEN</p>
        </div>
        <div className="overflow-x-auto">
          <div className="mx-auto" style={{ width: "fit-content" }}>
            {rows.map((row) => (
              <div key={row} className="flex items-center gap-1.5 mb-1.5">
                <span className="w-5 text-xs text-muted-foreground text-right" style={{ fontFamily: "'DM Mono', monospace" }}>{row}</span>
                <div className="flex gap-1.5">
                  {Array.from({ length: seatsPerRow }, (_, i) => {
                    const id = `${row}${i + 1}`; const isO = occupied.has(id); const isS = selected.has(id);
                    return <button key={id} onClick={() => toggleSeat(id)} disabled={isO} title={isO ? "Taken" : id}
                      className={`w-7 h-6 text-[9px] border transition-all ${isO ? "bg-muted border-muted cursor-not-allowed" : isS ? "bg-primary border-primary text-primary-foreground" : "border-border hover:border-primary/50 hover:bg-primary/10"}`}
                      style={{ fontFamily: "'DM Mono', monospace" }}>{isS ? "✓" : isO ? "" : i + 1}</button>;
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-center gap-6 mt-6 text-xs text-muted-foreground" style={{ fontFamily: "'DM Mono', monospace" }}>
          <span className="flex items-center gap-1.5"><span className="w-4 h-3 border border-border inline-block" />Available</span>
          <span className="flex items-center gap-1.5"><span className="w-4 h-3 bg-primary inline-block" />Selected</span>
          <span className="flex items-center gap-1.5"><span className="w-4 h-3 bg-muted inline-block" />Taken</span>
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-6 md:px-16 py-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground mb-0.5" style={{ fontFamily: "'DM Mono', monospace" }}>
            {selected.size} seat{selected.size !== 1 ? "s" : ""} selected{selected.size > 0 && <span className="ml-2 text-foreground">— {Array.from(selected).sort().join(", ")}</span>}
          </p>
          <p className="text-2xl font-black text-foreground" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{selected.size > 0 ? `£${total.toFixed(2)}` : "—"}</p>
        </div>
        <button disabled={selected.size === 0} onClick={() => onConfirm(Array.from(selected).sort())}
          className={`font-bold text-sm px-8 py-3 transition-all flex items-center gap-2 ${selected.size > 0 ? "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95" : "bg-muted text-muted-foreground cursor-not-allowed"}`}
          style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em" }}>
          <Ticket size={16} /> CHECKOUT
        </button>
      </div>
    </div>
  );
}

function ConfirmView({ booking, onHome }: { booking: Booking; onHome: () => void }) {
  const PRICES: Record<string, number> = { STANDARD: 14.5, IMAX: 22.0, "DOLBY ATMOS": 19.5 };
  const subtotal = booking.seats.length * (PRICES[booking.format] ?? 14.5);
  const total = subtotal + 1.5;
  const ref = "LUM-" + Math.random().toString(36).slice(2, 8).toUpperCase();
  return (
    <div className="min-h-screen bg-background pt-16 flex items-center justify-center px-6 py-12">
      <div className="max-w-xl w-full">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-primary/10 border border-primary/30 flex items-center justify-center mb-4"><Check size={28} className="text-primary" /></div>
          <h1 className="text-5xl font-black text-foreground uppercase text-center" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>Booking Confirmed</h1>
          <p className="text-muted-foreground text-sm mt-2" style={{ fontFamily: "'DM Mono', monospace" }}>Ref: {ref}</p>
        </div>
        <div className="border border-border bg-card relative">
          <div className="absolute -left-3 top-1/2 w-6 h-6 bg-background border border-border rounded-full -translate-y-1/2" />
          <div className="absolute -right-3 top-1/2 w-6 h-6 bg-background border border-border rounded-full -translate-y-1/2" />
          <div className="p-6">
            <div className="flex gap-4 mb-6">
              <img src={booking.film.posterImage} alt={booking.film.title} className="w-20 h-28 object-cover shrink-0" />
              <div>
                <h2 className="text-3xl font-black text-foreground uppercase leading-tight mb-1" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{booking.film.title}</h2>
                <p className="text-xs text-muted-foreground" style={{ fontFamily: "'DM Mono', monospace" }}>Directed by {booking.film.director}</p>
              </div>
            </div>
            <div className="border-t border-dashed border-border mb-6" />
            <div className="grid grid-cols-2 gap-4 mb-6">
              {[{ label: "DATE", value: `${booking.date}, 2025` }, { label: "TIME", value: booking.time }, { label: "FORMAT", value: booking.format }, { label: "CINEMA", value: "Lumière West End" }, { label: "SCREEN", value: "Screen 4" }, { label: "SEATS", value: booking.seats.join(", ") }].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-muted-foreground mb-0.5" style={{ fontFamily: "'DM Mono', monospace" }}>{label}</p>
                  <p className="font-bold text-foreground" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "1.1rem" }}>{value}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-dashed border-border mb-4" />
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between text-muted-foreground"><span style={{ fontFamily: "'DM Mono', monospace" }}>{booking.seats.length}× {booking.format}</span><span style={{ fontFamily: "'DM Mono', monospace" }}>£{subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-muted-foreground"><span style={{ fontFamily: "'DM Mono', monospace" }}>Booking fee</span><span style={{ fontFamily: "'DM Mono', monospace" }}>£1.50</span></div>
              <div className="flex justify-between font-bold text-foreground pt-2 border-t border-border"><span style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.06em", fontSize: "1.1rem" }}>TOTAL</span><span style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.06em", fontSize: "1.1rem" }}>£{total.toFixed(2)}</span></div>
            </div>
          </div>
          <div className="border-t border-border bg-muted px-6 py-3 flex items-center justify-between">
            <div className="flex gap-0.5">{Array.from({ length: 40 }, (_, i) => <div key={i} className="bg-foreground/30" style={{ width: Math.random() > 0.5 ? 2 : 1, height: 28 }} />)}</div>
            <span className="text-xs text-muted-foreground ml-4 shrink-0" style={{ fontFamily: "'DM Mono', monospace" }}>{ref}</span>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button className="flex-1 border border-primary text-primary text-sm font-bold py-3 hover:bg-primary/10 transition-colors" style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em" }}>DOWNLOAD TICKET</button>
          <button onClick={onHome} className="flex-1 bg-primary text-primary-foreground text-sm font-bold py-3 hover:bg-primary/90 transition-colors" style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em" }}>BROWSE MORE FILMS</button>
        </div>
      </div>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [films, setFilms] = useState<FilmType[]>(SEED_FILMS);
  const [cinemas, setCinemas] = useState<CinemaType[]>(SEED_CINEMAS);
  const [shows, setShows] = useState<ShowType[]>(SEED_SHOWS);
  const [location, setLocation] = useState("London, UK");

  const [mode, setMode] = useState<"public" | "admin-login" | "admin">("public");
  const [view, setView] = useState<View>("browse");
  const [selectedFilm, setSelectedFilm] = useState<FilmType | null>(null);
  const [booking, setBooking] = useState<Partial<Booking>>({});
  const [showSignIn, setShowSignIn] = useState(false);
  const [user, setUser] = useState<string | null>(null);

  const handleSelectFilm = (film: FilmType) => { setSelectedFilm(film); setBooking({ film }); setView("showtimes"); };
  const handleNav = (v: View) => { setView(v); setSelectedFilm(null); setBooking({}); };

  if (mode === "admin-login") {
    return <AdminLoginPage onLogin={() => setMode("admin")} />;
  }

  if (mode === "admin") {
    return (
      <AdminPanel
        films={films} setFilms={setFilms}
        cinemas={cinemas} setCinemas={setCinemas}
        shows={shows} setShows={setShows}
        location={location} setLocation={setLocation}
        onExit={() => setMode("public")}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <Nav
        activeView={view} onNav={handleNav}
        onSignIn={() => setShowSignIn(true)}
        user={user} onSignOut={() => setUser(null)}
        location={location}
        onAdminClick={() => setMode("admin-login")}
      />

      {view === "browse" && <BrowseView films={films} onSelect={handleSelectFilm} />}
      {view === "coming-soon" && <ComingSoonView />}
      {view === "cinemas" && <CinemasView cinemas={cinemas} />}
      {view === "memberships" && <MembershipsView onSignIn={() => setShowSignIn(true)} />}
      {view === "showtimes" && selectedFilm && (
        <ShowtimesView film={selectedFilm} onBack={() => setView("browse")} onSelect={(d, t, f) => { setBooking((b) => ({ ...b, date: d, time: t, format: f })); setView("seats"); }} />
      )}
      {view === "seats" && booking.film && booking.date && booking.time && booking.format && (
        <SeatsView booking={booking as Omit<Booking, "seats">} onBack={() => setView("showtimes")} onConfirm={(seats) => { setBooking((b) => ({ ...b, seats })); setView("confirm"); }} />
      )}
      {view === "confirm" && booking.film && booking.seats && (
        <ConfirmView booking={booking as Booking} onHome={() => handleNav("browse")} />
      )}

      {showSignIn && (
        <SignInModal onClose={() => setShowSignIn(false)} onSignedIn={(name) => { setUser(name); setShowSignIn(false); }} />
      )}
    </div>
  );
}
