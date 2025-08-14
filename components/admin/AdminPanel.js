import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Calendar, 
  Users, 
  BarChart3, 
  Play, 
  Plus,
  Edit,
  Trash2,
  Download,
  Save,
  X,
  Home,
  LogOut,
  Shield,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Clock,
  MapPin,
  Target,
  Award,
  Settings,
  Menu,
  ChevronDown,
  Search,
  Filter,
  Upload,
  FileText,
  Zap,
  TrendingUp,
  Activity,
  Bell,
  RefreshCw,
  User,
  Hash
} from 'lucide-react';

// Main Admin Panel Component
const AdminPanel = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedLeague, setSelectedLeague] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Sample data - would come from your API
  const [data, setData] = useState({
    leagues: [
      { 
        id: '1', 
        name: 'The Horse Futsal League 2025/26', 
        teams: 12, 
        matches: 132,
        logo: null,
        status: 'active'
      }
    ],
    teams: [
      { id: '1', name: 'Thunder Horses', players: 15, coach: 'Ahmed Hassan', logo: null },
      { id: '2', name: 'Lightning Stallions', players: 14, coach: 'Ibrahim Ali', logo: null },
      { id: '3', name: 'Ocean Waves', players: 16, coach: 'Mohamed Ahmed', logo: null },
      { id: '4', name: 'Island Eagles', players: 13, coach: 'Ali Mohamed', logo: null },
      { id: '5', name: 'Coral Reefs FC', players: 15, coach: 'Hassan Ibrahim', logo: null },
      { id: '6', name: 'Palm Warriors', players: 14, coach: 'Ahmed Ali', logo: null },
    ],
    matches: [
      { 
        id: '1', 
        homeTeam: 'Thunder Horses', 
        awayTeam: 'Lightning Stallions', 
        date: '2025-01-15', 
        time: '20:00', 
        status: 'scheduled',
        round: 1,
        venue: 'Central Arena'
      },
      { 
        id: '2', 
        homeTeam: 'Ocean Waves', 
        awayTeam: 'Thunder Horses', 
        date: '2025-01-16', 
        time: '21:00', 
        status: 'live',
        round: 1,
        venue: 'Beach Stadium',
        score: { home: 2, away: 1 },
        minute: 67
      },
    ],
    liveMatches: 1,
    totalGoals: 47,
    totalCards: 23,
    admins: [
      { id: '1', username: 'admin', role: 'Super Admin', createdAt: '2024-01-01', isDefault: true }
    ]
  });

  // Login state
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  // Modal state
  const [modals, setModals] = useState({
    league: { open: false, data: null },
    team: { open: false, data: null },
    player: { open: false, data: null },
    match: { open: false, data: null },
    schedule: { open: false, data: null },
    admin: { open: false, data: null },
    liveMatch: { open: false, data: null }
  });

  // Navigation items with mobile-friendly design
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, color: 'blue' },
    { id: 'leagues', label: 'Leagues', icon: Trophy, color: 'yellow' },
    { id: 'teams', label: 'Teams', icon: Users, color: 'green' },
    { id: 'matches', label: 'Matches', icon: Calendar, color: 'purple' },
    { id: 'live', label: 'Live Matches', icon: Play, color: 'red' },
    { id: 'stats', label: 'Statistics', icon: BarChart3, color: 'indigo' },
    { id: 'admin', label: 'Admin Users', icon: Shield, color: 'orange' },
  ];

  // Login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      if (loginForm.username === 'admin' && loginForm.password === 'admin123') {
        setIsLoggedIn(true);
        setCurrentUser({ username: 'admin', role: 'Super Admin' });
        setSelectedLeague(data.leagues[0]?.id || '');
      } else {
        alert('Invalid credentials');
      }
      setLoading(false);
    }, 1000);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setLoginForm({ username: '', password: '' });
    setActiveSection('dashboard');
  };

  // Modal handlers
  const openModal = (type, itemData = null) => {
    setModals(prev => ({
      ...prev,
      [type]: { open: true, data: itemData }
    }));
  };

  const closeModal = (type) => {
    setModals(prev => ({
      ...prev,
      [type]: { open: false, data: null }
    }));
  };

  // Mobile sidebar toggle
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Close sidebar on mobile when navigating
  const handleNavigation = (sectionId) => {
    setActiveSection(sectionId);
    setSidebarOpen(false);
  };

  // Login Screen
  if (!isLoggedIn) {
    return <LoginScreen 
      loginForm={loginForm}
      setLoginForm={setLoginForm}
      showPassword={showPassword}
      setShowPassword={setShowPassword}
      handleLogin={handleLogin}
      loading={loading}
    />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Mobile Header */}
      <MobileHeader 
        currentUser={currentUser}
        selectedLeague={selectedLeague}
        setSelectedLeague={setSelectedLeague}
        leagues={data.leagues}
        toggleSidebar={toggleSidebar}
        handleLogout={handleLogout}
        liveCount={data.liveMatches}
      />

      {/* Desktop Header */}
      <DesktopHeader 
        currentUser={currentUser}
        selectedLeague={selectedLeague}
        setSelectedLeague={setSelectedLeague}
        leagues={data.leagues}
        handleLogout={handleLogout}
        liveCount={data.liveMatches}
      />

      <div className="flex">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <Sidebar 
          navItems={navItems}
          activeSection={activeSection}
          handleNavigation={handleNavigation}
          sidebarOpen={sidebarOpen}
        />

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 pt-16 lg:pt-20">
          <div className="p-4 lg:p-6">
            {activeSection === 'dashboard' && (
              <DashboardSection 
                data={data} 
                selectedLeague={selectedLeague}
                openModal={openModal}
              />
            )}
            {activeSection === 'leagues' && (
              <LeaguesSection 
                data={data} 
                openModal={openModal}
              />
            )}
            {activeSection === 'teams' && (
              <TeamsSection 
                data={data} 
                selectedLeague={selectedLeague}
                openModal={openModal}
              />
            )}
            {activeSection === 'matches' && (
              <MatchesSection 
                data={data} 
                selectedLeague={selectedLeague}
                openModal={openModal}
              />
            )}
            {activeSection === 'live' && (
              <LiveSection 
                data={data} 
                selectedLeague={selectedLeague}
                openModal={openModal}
              />
            )}
            {activeSection === 'stats' && (
              <StatsSection 
                data={data} 
                selectedLeague={selectedLeague}
              />
            )}
            {activeSection === 'admin' && (
              <AdminSection 
                data={data} 
                openModal={openModal}
              />
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      {modals.league.open && (
        <LeagueModal 
          isOpen={modals.league.open}
          onClose={() => closeModal('league')}
          data={modals.league.data}
          onSave={(data) => {
            console.log('Save league:', data);
            closeModal('league');
          }}
        />
      )}

      {modals.team.open && (
        <TeamModal 
          isOpen={modals.team.open}
          onClose={() => closeModal('team')}
          data={modals.team.data}
          selectedLeague={selectedLeague}
          onSave={(data) => {
            console.log('Save team:', data);
            closeModal('team');
          }}
        />
      )}

      {modals.schedule.open && (
        <ScheduleModal 
          isOpen={modals.schedule.open}
          onClose={() => closeModal('schedule')}
          teams={data.teams}
          onGenerate={(scheduleData) => {
            console.log('Generate schedule:', scheduleData);
            closeModal('schedule');
          }}
        />
      )}

      {modals.liveMatch.open && (
        <LiveMatchModal 
          isOpen={modals.liveMatch.open}
          onClose={() => closeModal('liveMatch')}
          match={modals.liveMatch.data}
          teams={data.teams}
          onUpdate={(matchData) => {
            console.log('Update live match:', matchData);
          }}
        />
      )}
    </div>
  );
};

// Login Screen Component
const LoginScreen = ({ loginForm, setLoginForm, showPassword, setShowPassword, handleLogin, loading }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
    <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-2xl p-6 lg:p-8 w-full max-w-md border border-blue-500/20">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl mb-4">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Admin Panel</h1>
        <p className="text-slate-400">Horse Futsal League Management</p>
      </div>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Username</label>
          <input
            type="text"
            value={loginForm.username}
            onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="Enter your username"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={loginForm.password}
              onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12 transition-all duration-200"
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>
        
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Signing In...</span>
            </div>
          ) : (
            'Sign In'
          )}
        </button>
      </div>
      
      <div className="mt-6 p-4 bg-slate-700/30 rounded-lg">
        <p className="text-xs text-slate-400 text-center">
          Demo: admin / admin123
        </p>
      </div>
    </div>
  </div>
);

// Mobile Header Component
const MobileHeader = ({ currentUser, selectedLeague, setSelectedLeague, leagues, toggleSidebar, handleLogout, liveCount }) => (
  <header className="lg:hidden fixed top-0 left-0 right-0 bg-slate-800/95 backdrop-blur-sm border-b border-slate-700 z-50">
    <div className="flex items-center justify-between px-4 h-16">
      <div className="flex items-center space-x-3">
        <button
          onClick={toggleSidebar}
          className="text-white hover:text-blue-400 transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Admin</h1>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        {liveCount > 0 && (
          <div className="flex items-center space-x-1 bg-red-500/20 text-red-400 px-2 py-1 rounded-lg text-xs">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span>{liveCount}</span>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="text-slate-400 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </div>
    
    {/* League Selector */}
    <div className="px-4 pb-3">
      <select 
        value={selectedLeague}
        onChange={(e) => setSelectedLeague(e.target.value)}
        className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Select League</option>
        {leagues.map(league => (
          <option key={league.id} value={league.id}>{league.name}</option>
        ))}
      </select>
    </div>
  </header>
);

// Desktop Header Component
const DesktopHeader = ({ currentUser, selectedLeague, setSelectedLeague, leagues, handleLogout, liveCount }) => (
  <header className="hidden lg:block fixed top-0 left-0 right-0 bg-slate-800/95 backdrop-blur-sm border-b border-slate-700 z-50">
    <div className="max-w-7xl mx-auto px-6">
      <div className="flex items-center justify-between h-20">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
              <Trophy className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
              <p className="text-sm text-slate-400">Horse Futsal League</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
          {/* League Selector */}
          <select 
            value={selectedLeague}
            onChange={(e) => setSelectedLeague(e.target.value)}
            className="bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[200px]"
          >
            <option value="">Select League</option>
            {leagues.map(league => (
              <option key={league.id} value={league.id}>{league.name}</option>
            ))}
          </select>
          
          {/* Live Indicator */}
          {liveCount > 0 && (
            <div className="flex items-center space-x-2 bg-red-500/20 text-red-400 px-3 py-2 rounded-lg">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <span className="font-medium">{liveCount} LIVE</span>
            </div>
          )}
          
          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-white font-medium">{currentUser?.username}</p>
              <p className="text-slate-400 text-sm">{currentUser?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden xl:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
);

// Sidebar Component
const Sidebar = ({ navItems, activeSection, handleNavigation, sidebarOpen }) => (
  <nav className={`
    fixed top-16 lg:top-20 left-0 h-full w-64 bg-slate-800/95 backdrop-blur-sm border-r border-slate-700 z-40 transform transition-transform duration-300 ease-in-out
    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
  `}>
    <div className="p-4 lg:p-6">
      <div className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 group ${
                isActive
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  </nav>
);

// Dashboard Section
const DashboardSection = ({ data, selectedLeague, openModal }) => (
  <div className="space-y-6">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 className="text-2xl lg:text-3xl font-bold text-white">Dashboard</h2>
        <p className="text-slate-400 mt-1">Manage your futsal league operations</p>
      </div>
      <div className="flex items-center space-x-2 bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-2 rounded-lg">
        <AlertCircle className="w-4 h-4" />
        <span className="text-sm font-medium">Administrative Access</span>
      </div>
    </div>

    {/* Stats Grid */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      <StatCard title="Leagues" value="1" icon={Trophy} color="blue" />
      <StatCard title="Teams" value={data.teams.length} icon={Users} color="green" />
      <StatCard title="Live Now" value={data.liveMatches} icon={Play} color="red" />
      <StatCard title="Total Goals" value={data.totalGoals} icon={Target} color="orange" />
    </div>

    {/* Quick Actions */}
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
      <h3 className="text-xl font-semibold text-white mb-6">Quick Actions</h3>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickActionCard 
          title="Create League" 
          icon={Plus} 
          color="blue" 
          onClick={() => openModal('league')}
        />
        <QuickActionCard 
          title="Add Team" 
          icon={Users} 
          color="green" 
          onClick={() => openModal('team')}
          disabled={!selectedLeague}
        />
        <QuickActionCard 
          title="Generate Schedule" 
          icon={Calendar} 
          color="purple" 
          onClick={() => openModal('schedule')}
          disabled={!selectedLeague}
        />
        <QuickActionCard 
          title="Manage Live" 
          icon={Play} 
          color="red" 
          onClick={() => openModal('liveMatch')}
          disabled={!selectedLeague}
        />
      </div>
    </div>

    {/* Recent Activity & Live Matches */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
        <h3 className="text-xl font-semibold text-white mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <ActivityItem 
            action="Match Started" 
            details="Ocean Waves vs Thunder Horses" 
            time="2 minutes ago"
            type="live"
          />
          <ActivityItem 
            action="Team Added" 
            details="Lightning Stallions added to league" 
            time="1 hour ago"
            type="success"
          />
          <ActivityItem 
            action="Schedule Generated" 
            details="132 matches created for season" 
            time="3 hours ago"
            type="info"
          />
        </div>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
        <h3 className="text-xl font-semibold text-white mb-4">Live Matches</h3>
        {data.liveMatches > 0 ? (
          <div className="space-y-3">
            {data.matches.filter(m => m.status === 'live').map(match => (
              <div key={match.id} className="p-4 bg-gradient-to-r from-red-500/10 to-red-600/10 border border-red-500/20 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-red-400 font-medium text-sm">LIVE</span>
                  </div>
                  <span className="text-slate-400 text-sm">{match.minute}'</span>
                </div>
                <h4 className="text-white font-semibold">{match.homeTeam} vs {match.awayTeam}</h4>
                <p className="text-slate-400 text-sm">{match.score?.home || 0} - {match.score?.away || 0}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400 text-center py-8">No live matches</p>
        )}
      </div>
    </div>
  </div>
);

// Teams Section
const TeamsSection = ({ data, selectedLeague, openModal }) => (
  <div className="space-y-6">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 className="text-2xl lg:text-3xl font-bold text-white">Team Management</h2>
        <p className="text-slate-400 mt-1">Manage teams and players</p>
      </div>
      <button
        onClick={() => openModal('team')}
        disabled={!selectedLeague}
        className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        <Plus className="w-4 h-4" />
        <span>Add Team</span>
      </button>
    </div>

    {!selectedLeague ? (
      <EmptyState 
        icon={Users}
        title="Select a League"
        description="Choose a league from the dropdown above to manage teams."
      />
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.teams.map(team => (
          <TeamCard key={team.id} team={team} onEdit={() => openModal('team', team)} />
        ))}
      </div>
    )}
  </div>
);

// Matches Section
const MatchesSection = ({ data, selectedLeague, openModal }) => (
  <div className="space-y-6">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 className="text-2xl lg:text-3xl font-bold text-white">Match Management</h2>
        <p className="text-slate-400 mt-1">Schedule and manage matches</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => openModal('schedule')}
          disabled={!selectedLeague}
          className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          <Calendar className="w-4 h-4" />
          <span>Generate Schedule</span>
        </button>
        <button
          onClick={() => openModal('match')}
          disabled={!selectedLeague}
          className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>Add Match</span>
        </button>
      </div>
    </div>

    {!selectedLeague ? (
      <EmptyState 
        icon={Calendar}
        title="Select a League"
        description="Choose a league from the dropdown above to manage matches."
      />
    ) : (
      <div className="space-y-4">
        {data.matches.map(match => (
          <MatchCard key={match.id} match={match} onEdit={() => openModal('match', match)} />
        ))}
      </div>
    )}
  </div>
);

// Live Section
const LiveSection = ({ data, selectedLeague, openModal }) => (
  <div className="space-y-6">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 className="text-2xl lg:text-3xl font-bold text-white">Live Match Management</h2>
        <p className="text-slate-400 mt-1">Monitor and control live matches</p>
      </div>
      <div className="flex items-center space-x-2 bg-red-500/20 text-red-400 px-3 py-2 rounded-lg">
        <Play className="w-4 h-4" />
        <span className="text-sm font-medium">{data.liveMatches} Live Now</span>
      </div>
    </div>

    {!selectedLeague ? (
      <EmptyState 
        icon={Play}
        title="Select a League"
        description="Choose a league from the dropdown above to manage live matches."
      />
    ) : (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Matches */}
        {data.matches.filter(m => m.status === 'live').map(match => (
          <LiveMatchCard 
            key={match.id} 
            match={match} 
            onManage={() => openModal('liveMatch', match)}
          />
        ))}
        
        {/* Scheduled Matches */}
        {data.matches.filter(m => m.status === 'scheduled').slice(0, 4).map(match => (
          <ScheduledMatchCard 
            key={match.id} 
            match={match} 
            onStart={() => openModal('liveMatch', match)}
          />
        ))}
      </div>
    )}
  </div>
);

// Stats Section
const StatsSection = ({ data, selectedLeague }) => (
  <div className="space-y-6">
    <div>
      <h2 className="text-2xl lg:text-3xl font-bold text-white">Statistics Overview</h2>
      <p className="text-slate-400 mt-1">League performance and analytics</p>
    </div>
    
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      <StatCard title="Total Goals" value={data.totalGoals} icon={Target} color="green" />
      <StatCard title="Total Cards" value={data.totalCards} icon={AlertCircle} color="orange" />
      <StatCard title="Avg Goals/Match" value="3.2" icon={BarChart3} color="blue" />
      <StatCard title="Clean Sheets" value="8" icon={Award} color="purple" />
    </div>

    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
      <h3 className="text-xl font-semibold text-white mb-6">League Statistics</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h4 className="text-lg font-medium text-white mb-4 flex items-center space-x-2">
            <Target className="w-5 h-5 text-green-400" />
            <span>Top Scorers</span>
          </h4>
          <div className="space-y-3">
            <PlayerStatCard name="Ahmed Hassan" team="Thunder Horses" value="12 goals" />
            <PlayerStatCard name="Mohamed Ali" team="Ocean Waves" value="10 goals" />
            <PlayerStatCard name="Ibrahim Ahmed" team="Lightning Stallions" value="8 goals" />
          </div>
        </div>
        
        <div>
          <h4 className="text-lg font-medium text-white mb-4 flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-orange-400" />
            <span>Most Cards</span>
          </h4>
          <div className="space-y-3">
            <PlayerStatCard name="Ali Hassan" team="Palm Warriors" value="5 cards" />
            <PlayerStatCard name="Hassan Ibrahim" team="Coral Reefs FC" value="4 cards" />
            <PlayerStatCard name="Ahmed Ali" team="Island Eagles" value="3 cards" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Admin Section
const AdminSection = ({ data, openModal }) => (
  <div className="space-y-6">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 className="text-2xl lg:text-3xl font-bold text-white">Admin User Management</h2>
        <p className="text-slate-400 mt-1">Manage admin accounts and permissions</p>
      </div>
      <button
        onClick={() => openModal('admin')}
        className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200"
      >
        <Plus className="w-4 h-4" />
        <span>Add Admin</span>
      </button>
    </div>
    
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-700/50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Username</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Role</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Created</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {data.admins.map(admin => (
              <tr key={admin.id} className="hover:bg-slate-700/25 transition-colors">
                <td className="px-6 py-4 text-white font-medium">{admin.username}</td>
                <td className="px-6 py-4">
                  <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded-lg text-xs font-medium">
                    {admin.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-400">{admin.createdAt}</td>
                <td className="px-6 py-4">
                  {admin.isDefault ? (
                    <span className="text-slate-500 text-sm">Default Admin</span>
                  ) : (
                    <button className="text-red-400 hover:text-red-300 text-sm">
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

// Leagues Section
const LeaguesSection = ({ data, openModal }) => (
  <div className="space-y-6">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 className="text-2xl lg:text-3xl font-bold text-white">League Management</h2>
        <p className="text-slate-400 mt-1">Create and manage tournaments</p>
      </div>
      <button
        onClick={() => openModal('league')}
        className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
      >
        <Plus className="w-4 h-4" />
        <span>Create League</span>
      </button>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {data.leagues.map(league => (
        <LeagueCard key={league.id} league={league} onEdit={() => openModal('league', league)} />
      ))}
    </div>
  </div>
);

// Component Library

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    red: 'from-red-500 to-red-600',
    orange: 'from-orange-500 to-orange-600',
    purple: 'from-purple-500 to-purple-600'
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm font-medium">{title}</p>
          <p className="text-2xl lg:text-3xl font-bold text-white mt-1">{value}</p>
        </div>
        <div className={`w-12 h-12 bg-gradient-to-r ${colorClasses[color]} rounded-xl flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
};

// Quick Action Card Component
const QuickActionCard = ({ title, icon: Icon, color, onClick, disabled = false }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
    green: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
    red: 'from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
    orange: 'from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700',
    purple: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`bg-gradient-to-r ${colorClasses[color]} p-4 lg:p-6 rounded-xl text-white transition-all duration-200 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
    >
      <Icon className="w-6 h-6 lg:w-8 lg:h-8 mx-auto mb-2" />
      <p className="font-medium text-sm lg:text-base">{title}</p>
    </button>
  );
};

// Team Card Component
const TeamCard = ({ team, onEdit }) => (
  <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-blue-500/50 transition-all duration-200">
    <div className="flex items-center justify-between mb-4">
      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
        <span className="text-white font-bold text-lg">{team.name.substring(0, 2)}</span>
      </div>
      <button
        onClick={onEdit}
        className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-700/50 rounded-lg"
      >
        <Edit className="w-4 h-4" />
      </button>
    </div>
    <h3 className="text-lg font-semibold text-white mb-2">{team.name}</h3>
    <div className="space-y-1 text-sm text-slate-400">
      <p className="flex items-center space-x-2">
        <Users className="w-4 h-4" />
        <span>{team.players} players</span>
      </p>
      <p className="flex items-center space-x-2">
        <User className="w-4 h-4" />
        <span>Coach: {team.coach}</span>
      </p>
    </div>
  </div>
);

// Match Card Component
const MatchCard = ({ match, onEdit }) => {
  const statusColors = {
    scheduled: 'bg-blue-500/20 text-blue-400 border-blue-500/20',
    live: 'bg-red-500/20 text-red-400 border-red-500/20',
    finished: 'bg-green-500/20 text-green-400 border-green-500/20'
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-4 mb-3">
            <h3 className="text-lg font-semibold text-white">
              {match.homeTeam} vs {match.awayTeam}
            </h3>
            <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium border ${statusColors[match.status]} w-fit`}>
              {match.status === 'live' && <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-1" />}
              {match.status.toUpperCase()}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
            <span className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{match.date}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{match.time}</span>
            </span>
            <span className="flex items-center space-x-1">
              <MapPin className="w-4 h-4" />
              <span>{match.venue}</span>
            </span>
          </div>
          {match.score && (
            <div className="mt-2 text-xl font-bold text-white">
              {match.score.home} - {match.score.away}
            </div>
          )}
        </div>
        <button
          onClick={onEdit}
          className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-700/50 rounded-lg ml-4"
        >
          <Edit className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Live Match Card Component
const LiveMatchCard = ({ match, onManage }) => (
  <div className="bg-gradient-to-r from-red-500/10 to-red-600/10 border border-red-500/30 rounded-2xl p-6">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-2">
        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
        <span className="text-red-400 font-bold">LIVE</span>
      </div>
      <span className="text-slate-400 text-sm bg-slate-800/50 px-2 py-1 rounded">{match.minute}'</span>
    </div>
    <div className="text-center">
      <h3 className="text-xl font-bold text-white mb-2">
        {match.homeTeam} {match.score?.home || 0} - {match.score?.away || 0} {match.awayTeam}
      </h3>
      <p className="text-slate-400 text-sm mb-4">{match.venue}</p>
      <button
        onClick={onManage}
        className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors font-medium"
      >
        Manage Live
      </button>
    </div>
  </div>
);

// Scheduled Match Card Component
const ScheduledMatchCard = ({ match, onStart }) => (
  <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
    <h3 className="text-lg font-semibold text-white mb-2">
      {match.homeTeam} vs {match.awayTeam}
    </h3>
    <div className="flex items-center justify-between">
      <div className="text-sm text-slate-400">
        <p className="flex items-center space-x-1 mb-1">
          <Calendar className="w-4 h-4" />
          <span>{match.date} at {match.time}</span>
        </p>
        <p className="flex items-center space-x-1">
          <MapPin className="w-4 h-4" />
          <span>{match.venue}</span>
        </p>
      </div>
      <button
        onClick={onStart}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition-colors font-medium"
      >
        Start Live
      </button>
    </div>
  </div>
);

// Activity Item Component
const ActivityItem = ({ action, details, time, type }) => {
  const typeColors = {
    live: 'bg-red-400',
    success: 'bg-green-400',
    info: 'bg-blue-400'
  };

  return (
    <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-700/30 hover:bg-slate-700/50 transition-colors">
      <div className={`w-2 h-2 rounded-full mt-2 ${typeColors[type]}`} />
      <div className="flex-1 min-w-0">
        <p className="text-white font-medium">{action}</p>
        <p className="text-slate-400 text-sm truncate">{details}</p>
      </div>
      <span className="text-slate-400 text-xs whitespace-nowrap">{time}</span>
    </div>
  );
};

// League Card Component
const LeagueCard = ({ league, onEdit }) => (
  <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-blue-500/50 transition-all duration-200">
    <div className="flex items-center justify-between mb-4">
      <Trophy className="w-8 h-8 text-yellow-400" />
      <button
        onClick={onEdit}
        className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-700/50 rounded-lg"
      >
        <Edit className="w-4 h-4" />
      </button>
    </div>
    <h3 className="text-lg font-semibold text-white mb-2">{league.name}</h3>
    <div className="space-y-1 text-sm text-slate-400">
      <p className="flex items-center space-x-2">
        <Users className="w-4 h-4" />
        <span>{league.teams} teams</span>
      </p>
      <p className="flex items-center space-x-2">
        <Calendar className="w-4 h-4" />
        <span>{league.matches} matches</span>
      </p>
    </div>
  </div>
);

// Player Stat Card Component
const PlayerStatCard = ({ name, team, value }) => (
  <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-xl hover:bg-slate-700/50 transition-colors">
    <div>
      <p className="text-white font-medium">{name}</p>
      <p className="text-slate-400 text-sm">{team}</p>
    </div>
    <span className="text-blue-400 font-semibold">{value}</span>
  </div>
);

// Empty State Component
const EmptyState = ({ icon: Icon, title, description }) => (
  <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-12 border border-slate-700/50 text-center">
    <Icon className="w-16 h-16 text-slate-400 mx-auto mb-4" />
    <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
    <p className="text-slate-400">{description}</p>
  </div>
);

// Modal Components
const LeagueModal = ({ isOpen, onClose, data, onSave }) => {
  const [formData, setFormData] = useState(data || { name: '', logo: null });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">
            {data ? 'Edit League' : 'Create League'}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">League Name *</label>
            <input
              type="text"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Spring Tournament 2024"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">League Logo</label>
            <input
              type="file"
              accept="image/*"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setFormData({...formData, logo: e.target.files[0]})}
            />
          </div>
        </div>

        <div className="flex space-x-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(formData)}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
          >
            {data ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
};

const TeamModal = ({ isOpen, onClose, data, selectedLeague, onSave }) => {
  const [formData, setFormData] = useState(data || { name: '', coach: '', stadium: '', logo: null });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">
            {data ? 'Edit Team' : 'Add Team'}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!selectedLeague ? (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-orange-400 mx-auto mb-4" />
            <p className="text-white">Please select a league first</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Team Name *</label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Thunder Horses"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Coach</label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Ahmed Hassan"
                value={formData.coach}
                onChange={(e) => setFormData({...formData, coach: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Stadium</label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Central Arena"
                value={formData.stadium}
                onChange={(e) => setFormData({...formData, stadium: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Team Logo</label>
              <input
                type="file"
                accept="image/*"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setFormData({...formData, logo: e.target.files[0]})}
              />
            </div>
          </div>
        )}

        <div className="flex space-x-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(formData)}
            disabled={!selectedLeague}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {data ? 'Update' : 'Add'} Team
          </button>
        </div>
      </div>
    </div>
  );
};

const ScheduleModal = ({ isOpen, onClose, teams, onGenerate }) => {
  const [formData, setFormData] = useState({
    format: 'double-round-robin',
    startDate: '',
    daysBetween: 7,
    timePeriods: ['20:00', '21:00', '22:00']
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-lg border border-slate-700 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Generate Schedule</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Tournament Format</label>
            <select
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.format}
              onChange={(e) => setFormData({...formData, format: e.target.value})}
            >
              <option value="double-round-robin">Double Round Robin (Home & Away)</option>
              <option value="single-round-robin">Single Round Robin (Once Each)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Start Date *</label>
            <input
              type="date"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.startDate}
              onChange={(e) => setFormData({...formData, startDate: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Days Between Rounds</label>
            <select
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.daysBetween}
              onChange={(e) => setFormData({...formData, daysBetween: parseInt(e.target.value)})}
            >
              <option value="3">3 days</option>
              <option value="7">1 week</option>
              <option value="14">2 weeks</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Match Time Periods</label>
            <div className="space-y-2">
              {formData.timePeriods.map((time, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="time"
                    className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={time}
                    onChange={(e) => {
                      const newTimes = [...formData.timePeriods];
                      newTimes[index] = e.target.value;
                      setFormData({...formData, timePeriods: newTimes});
                    }}
                  />
                  {formData.timePeriods.length > 1 && (
                    <button
                      onClick={() => {
                        const newTimes = formData.timePeriods.filter((_, i) => i !== index);
                        setFormData({...formData, timePeriods: newTimes});
                      }}
                      className="text-red-400 hover:text-red-300 p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => setFormData({...formData, timePeriods: [...formData.timePeriods, '21:00']})}
                className="text-blue-400 hover:text-blue-300 text-sm flex items-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Add Time Period</span>
              </button>
            </div>
          </div>

          {/* Schedule Preview */}
          <div className="bg-slate-700/30 rounded-lg p-4">
            <h4 className="text-white font-medium mb-2">Schedule Preview</h4>
            <div className="text-sm text-slate-400 space-y-1">
              <p>Teams: {teams.length}</p>
              <p>Format: {formData.format === 'double-round-robin' ? 'Double Round Robin' : 'Single Round Robin'}</p>
              <p>Expected Matches: {formData.format === 'double-round-robin' ? teams.length * (teams.length - 1) : (teams.length * (teams.length - 1)) / 2}</p>
              <p>Time Slots: {formData.timePeriods.length}</p>
            </div>
          </div>
        </div>

        <div className="flex space-x-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onGenerate(formData)}
            disabled={!formData.startDate || teams.length < 2}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Generate Schedule
          </button>
        </div>
      </div>
    </div>
  );
};

const LiveMatchModal = ({ isOpen, onClose, match, teams, onUpdate }) => {
  const [liveData, setLiveData] = useState({
    homeScore: match?.score?.home || 0,
    awayScore: match?.score?.away || 0,
    minute: match?.minute || 0,
    status: match?.status || 'scheduled',
    events: []
  });

  if (!isOpen || !match) return null;

  const updateScore = (team, increment) => {
    if (team === 'home') {
      setLiveData(prev => ({
        ...prev,
        homeScore: Math.max(0, prev.homeScore + increment)
      }));
    } else {
      setLiveData(prev => ({
        ...prev,
        awayScore: Math.max(0, prev.awayScore + increment)
      }));
    }
  };

  const addEvent = (type, team, player = null) => {
    const event = {
      id: Date.now(),
      type,
      team,
      player,
      minute: liveData.minute,
      timestamp: new Date().toISOString()
    };
    setLiveData(prev => ({
      ...prev,
      events: [event, ...prev.events]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
            <Play className="w-6 h-6 text-red-500" />
            <span>Live Match Control</span>
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Match Header */}
        <div className="bg-gradient-to-r from-red-500/10 to-red-600/10 border border-red-500/20 rounded-xl p-6 mb-6">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <span className="text-red-400 font-bold">LIVE</span>
              </div>
              <div className="text-slate-400 bg-slate-800/50 px-3 py-1 rounded-lg">
                {liveData.minute}'
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              {match.homeTeam} {liveData.homeScore} - {liveData.awayScore} {match.awayTeam}
            </h2>
            <p className="text-slate-400">{match.venue}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Score Control */}
          <div className="space-y-6">
            <div className="bg-slate-700/30 rounded-xl p-6">
              <h4 className="text-white font-semibold mb-4 flex items-center space-x-2">
                <Target className="w-5 h-5" />
                <span>Score Control</span>
              </h4>
              
              {/* Home Team */}
              <div className="mb-6">
                <h5 className="text-slate-300 font-medium mb-2">{match.homeTeam}</h5>
                <div className="flex items-center space-x-4">
                  <div className="text-4xl font-bold text-white bg-slate-800 rounded-lg px-4 py-2 min-w-[80px] text-center">
                    {liveData.homeScore}
                  </div>
                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={() => updateScore('home', 1)}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded transition-colors"
                    >
                      +1
                    </button>
                    <button
                      onClick={() => updateScore('home', -1)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition-colors"
                    >
                      -1
                    </button>
                  </div>
                  <button
                    onClick={() => addEvent('goal', 'home')}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    + Goal
                  </button>
                </div>
              </div>

              {/* Away Team */}
              <div>
                <h5 className="text-slate-300 font-medium mb-2">{match.awayTeam}</h5>
                <div className="flex items-center space-x-4">
                  <div className="text-4xl font-bold text-white bg-slate-800 rounded-lg px-4 py-2 min-w-[80px] text-center">
                    {liveData.awayScore}
                  </div>
                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={() => updateScore('away', 1)}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded transition-colors"
                    >
                      +1
                    </button>
                    <button
                      onClick={() => updateScore('away', -1)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition-colors"
                    >
                      -1
                    </button>
                  </div>
                  <button
                    onClick={() => addEvent('goal', 'away')}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    + Goal
                  </button>
                </div>
              </div>
            </div>

            {/* Match Control */}
            <div className="bg-slate-700/30 rounded-xl p-6">
              <h4 className="text-white font-semibold mb-4 flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Match Control</span>
              </h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-300 text-sm mb-2">Current Minute</label>
                  <input
                    type="number"
                    min="0"
                    max="120"
                    value={liveData.minute}
                    onChange={(e) => setLiveData(prev => ({...prev, minute: parseInt(e.target.value) || 0}))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setLiveData(prev => ({...prev, status: 'live'}))}
                    className="bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg transition-colors"
                  >
                    Start Match
                  </button>
                  <button
                    onClick={() => setLiveData(prev => ({...prev, status: 'finished'}))}
                    className="bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg transition-colors"
                  >
                    End Match
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Events & Cards */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-slate-700/30 rounded-xl p-6">
              <h4 className="text-white font-semibold mb-4 flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span>Quick Actions</span>
              </h4>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => addEvent('yellow_card', 'home')}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-lg transition-colors text-sm"
                >
                  🟨 Home
                </button>
                <button
                  onClick={() => addEvent('yellow_card', 'away')}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-lg transition-colors text-sm"
                >
                  🟨 Away
                </button>
                <button
                  onClick={() => addEvent('red_card', 'home')}
                  className="bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-colors text-sm"
                >
                  🟥 Home
                </button>
                <button
                  onClick={() => addEvent('red_card', 'away')}
                  className="bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-colors text-sm"
                >
                  🟥 Away
                </button>
              </div>
            </div>

            {/* Match Events */}
            <div className="bg-slate-700/30 rounded-xl p-6">
              <h4 className="text-white font-semibold mb-4 flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Match Events</span>
              </h4>
              
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {liveData.events.length > 0 ? (
                  liveData.events.map(event => (
                    <div key={event.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-blue-400 font-mono text-sm">{event.minute}'</span>
                        <span className="text-white">
                          {event.type === 'goal' ? '⚽' : event.type === 'yellow_card' ? '🟨' : '🟥'}
                          {event.type.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className="text-slate-400 text-sm">
                          {event.team === 'home' ? match.homeTeam : match.awayTeam}
                        </span>
                      </div>
                      <button
                        onClick={() => setLiveData(prev => ({
                          ...prev,
                          events: prev.events.filter(e => e.id !== event.id)
                        }))}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 text-center py-4">No events yet</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => {
              onUpdate({
                ...match,
                score: { home: liveData.homeScore, away: liveData.awayScore },
                minute: liveData.minute,
                status: liveData.status,
                events: liveData.events
              });
              onClose();
            }}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
          >
            Save & Update
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;