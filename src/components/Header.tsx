import { Button } from "./ui/button"
import { Menu } from "lucide-react"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="text-xl font-bold">DataInsight Pro</span>
        </div>
        
        <nav className="hidden md:flex space-x-6">
          <Button variant="ghost">Home</Button>
          <Button variant="ghost">Features</Button>
          <Button variant="ghost">Pricing</Button>
          <Button variant="ghost">Dashboard</Button>
        </nav>

        <div className="hidden md:block">
          <Button>Sign In</Button>
        </div>

        <Button 
          variant="ghost" 
          className="md:hidden p-2" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <Menu className="h-6 w-6" />
        </Button>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <nav className="md:hidden bg-white border-t">
          <div className="container mx-auto px-4 py-2 flex flex-col space-y-2">
            <Button variant="ghost" className="justify-start">Home</Button>
            <Button variant="ghost" className="justify-start">Features</Button>
            <Button variant="ghost" className="justify-start">Pricing</Button>
            <Button variant="ghost" className="justify-start">Dashboard</Button>
            <Button className="justify-start">Sign In</Button>
          </div>
        </nav>
      )}
    </header>
  )
}
