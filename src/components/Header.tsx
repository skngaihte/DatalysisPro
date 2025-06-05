<header className="border-b sticky top-0 bg-background z-10">
  <div className="container flex h-16 items-center justify-between px-4">
    <div className="flex items-center gap-2">
      <Shield className="h-6 w-6 text-primary" />
      <span className="font-bold text-xl">DataInsight Pro</span>
    </div>
    <nav className="hidden md:flex gap-6">
      {['home', 'features', 'dashboard'].map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`capitalize transition-colors duration-200 ${
            activeTab === tab ? 'text-primary font-medium' : 'text-muted'
          }`}
        >
          {tab}
        </button>
      ))}
    </nav>
    <Button size="sm" variant="outline">
      Sign In
    </Button>
  </div>
</header>