"use client"

import { useState, useEffect } from "react"
import { Search, ShoppingCart, Star, Check, MessageCircle, Phone, ChevronDown, User, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"
import { getAllDishes } from "@/lib/storage"

interface Dish {
  id: string
  name: string
  category: string
  price: number
  description: string
  rating: number
  image: string
  video: string // Changed from gif to video
}

const defaultDishes: Dish[] = [
  {
    id: "1",
    name: "Veg Angara",
    category: "Spicy",
    price: 299,
    description: "Spicy mixed vegetable curry with aromatic spices",
    rating: 4,
    image: "/images/paneer-curry.webp",
    video: "/gifs/hotel-branding.gif", // Using available GIF as fallback
  },
  {
    id: "2",
    name: "Shev Bhaji",
    category: "Spicy",
    price: 199,
    description: "SPICY MAHARASHTRIAN CURRY TOPPED WITH CRUNCHY SHEV, COOKED IN TOMATO-ONION GRAVY.",
    rating: 4,
    image: "/images/sizzling-dish.jpeg",
    video: "/gifs/pasta-dish.gif", // Using available GIF as fallback
  },
  {
    id: "3",
    name: "Veg handi",
    category: "Chef Special",
    price: 399,
    description: "Mixed vegetables cooked in traditional handi style",
    rating: 5,
    image: "/images/matar-paneer.webp",
    video: "/gifs/hotel-branding.gif", // Using available GIF as fallback
  },
  {
    id: "4",
    name: "Mater Paneer",
    category: "Low Oil",
    price: 299,
    description: "Fresh paneer cubes with green peas in rich tomato gravy",
    rating: 4,
    image: "/images/matar-paneer.webp",
    video: "/gifs/pasta-dish.gif", // Using available GIF as fallback
  },
  {
    id: "5",
    name: "Paneer Sultani",
    category: "Chef Special",
    price: 299,
    description: "Royal paneer dish with rich and creamy gravy",
    rating: 5,
    image: "/images/paneer-curry.webp",
    video: "/gifs/hotel-branding.gif", // Using available GIF as fallback
  },
]

export default function HomePage() {
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const [showSearchPopup, setShowSearchPopup] = useState(false)
  const [showOrderDropdown, setShowOrderDropdown] = useState(false)
  const [showReviewsDropdown, setShowReviewsDropdown] = useState(false)
  const [showMenuDropdown, setShowMenuDropdown] = useState(false)
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [adminUsername, setAdminUsername] = useState("")
  const [adminPassword, setAdminPassword] = useState("")
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false)

  const [dishes, setDishes] = useState<Dish[]>(defaultDishes)
  const [filteredDishes, setFilteredDishes] = useState<Dish[]>(defaultDishes)
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("All")
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [cartCount, setCartCount] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [videoError, setVideoError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const filters = ["All", "Spicy", "Jain", "Low Oil", "Chef Special"]

  useEffect(() => {
    const loadDishes = async () => {
      try {
        const dishesFromDB = await getAllDishes()
        
        // Create blob URLs for dishes that have blob data
        const dishesWithBlobUrls = dishesFromDB.map(dish => {
          const updatedDish = { ...dish }
          
          // Create blob URL for video if videoBlob exists
          if (dish.videoBlob) {
            // Revoke old URL if it exists
            if (dish.video && dish.video.startsWith('blob:')) {
              URL.revokeObjectURL(dish.video)
            }
            updatedDish.video = URL.createObjectURL(dish.videoBlob)
          }
          
          // Create blob URL for image if imageBlob exists
          if (dish.imageBlob) {
            // Revoke old URL if it exists
            if (dish.image && dish.image.startsWith('blob:')) {
              URL.revokeObjectURL(dish.image)
            }
            updatedDish.image = URL.createObjectURL(dish.imageBlob)
          }
          
          return updatedDish
        })
        
        // If no dishes in DB, use defaults
        const finalDishes = dishesWithBlobUrls.length > 0 ? dishesWithBlobUrls : defaultDishes
        
        setDishes(finalDishes)
        setFilteredDishes(finalDishes)
        
        console.log('Loaded dishes:', finalDishes.length)
      } catch (error) {
        console.error('Error loading dishes:', error)
        // Fallback to default dishes
        setDishes(defaultDishes)
        setFilteredDishes(defaultDishes)
      }
    }
    loadDishes()
    
    // Load cart count from localStorage
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      const cartItems = JSON.parse(savedCart)
      setCartCount(cartItems.length)
    }
  }, [])

  useEffect(() => {
    let filtered = dishes

    if (searchTerm) {
      filtered = filtered.filter((dish) => dish.name.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    if (selectedFilter !== "All") {
      filtered = filtered.filter((dish) => dish.category === selectedFilter)
    }

    setFilteredDishes(filtered)
  }, [dishes, searchTerm, selectedFilter])

  const handleDishClick = (dish: Dish) => {
    setSelectedDish(dish)
  }

  const handleItemSelect = (dishId: string) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(dishId)) {
      newSelected.delete(dishId)
    } else {
      newSelected.add(dishId)
    }
    setSelectedItems(newSelected)
  }

  const handleAddToCart = () => {
    setIsLoading(true)
    
    try {
      const selectedDishesData = dishes.filter((dish) => selectedItems.has(dish.id))
      const currentCart = JSON.parse(localStorage.getItem("cart") || "[]")

      const itemsToAdd = []
      for (let i = 0; i < quantity; i++) {
        itemsToAdd.push(...selectedDishesData)
      }

      const updatedCart = [...currentCart, ...itemsToAdd]
      localStorage.setItem("cart", JSON.stringify(updatedCart))
      setCartCount(updatedCart.length)
      setSelectedItems(new Set())
      setQuantity(1)
      
      // Show success message
      alert(`Added ${selectedDishesData.length * quantity} item(s) to cart!`)
    } catch (error) {
      console.error('Error adding to cart:', error)
      alert('Failed to add items to cart. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdminLogin = () => {
    if (adminUsername === "ADMIN" && adminPassword === "123") {
      setIsAdminLoggedIn(true)
      setShowAdminLogin(false)
      window.location.href = "/admin"
    } else {
      alert("Invalid credentials! Use Username: ADMIN, Password: 123")
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-6 h-6 ${i < rating ? "fill-yellow-400 text-yellow-400" : "fill-white text-white"}`} />
    ))
  }

  const currentVideo = selectedDish ? selectedDish.video : "/gifs/hotel-branding.gif" // Using default GIF
  const currentDishName = selectedDish ? selectedDish.name : "HOTEL BRANDING"
  const currentDescription = selectedDish ? selectedDish.description : "Welcome to Hotel-Veg"
  
  // Function to handle video errors and fallback
  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    console.warn('Video failed to load:', e.currentTarget.src)
    console.warn('Video error event:', e)
    setVideoError(true)
    const video = e.currentTarget
    
    // Try fallback to GIF only if not already a GIF
    if ((video.src.includes('.mp4') || video.src.includes('blob:')) && !video.src.includes('.gif')) {
      console.log('Switching to fallback GIF')
      video.src = '/gifs/hotel-branding.gif'
      // Force reload the video element
      video.load()
    }
  }
  
  // Function to handle video load success
  const handleVideoLoad = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    console.log('Video loaded successfully:', e.currentTarget.src)
    setVideoError(false)
  }

  return (
    <div className="min-h-screen bg-gray-200">
      {/* Search Popup */}
      {showSearchPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20">
          <div className="bg-white rounded-lg p-4 w-80 mx-4">
            <div className="relative">
              <Input
                placeholder="Search dishes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 border-2 border-green-400 rounded-full pl-4 pr-12"
                autoFocus
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-600" />
            </div>
            <div className="flex justify-end mt-3">
              <Button
                onClick={() => setShowSearchPopup(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Login Popup */}
      {showAdminLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-80 mx-4">
            <h2 className="text-xl font-bold mb-4 text-center">Admin Login</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">Username</label>
                <Input
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  placeholder="Enter username"
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Password</label>
                <Input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleAdminLogin}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded"
                >
                  Login
                </Button>
                <Button
                  onClick={() => setShowAdminLogin(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        {/* Desktop Header */}
        <header className="bg-gray-200 px-6 py-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-white rounded border-4 border-green-600 flex items-center justify-center">
                <div className="w-10 h-10 bg-green-600 rounded-full"></div>
              </div>
              <h1 className="text-4xl font-bold text-gray-800">HOTEL-VEG</h1>
            </div>

            <div className="flex items-center gap-6">
              <div className="relative">
                <Input
                  placeholder="SEARCH DISH"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-96 h-12 bg-white border-4 border-green-400 rounded-full pl-6 pr-16 text-lg font-medium"
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-green-400 rounded-full flex items-center justify-center">
                  <Search className="w-5 h-5 text-white" />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  <span className="font-bold">ORDER NOW</span>
                </Button>
                <a
                  href="tel:8788477859"
                  className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-3 rounded font-bold text-lg transition-colors"
                >
                  8788477859
                </a>
              </div>

              <Button className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded font-bold">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-2">
                  <span className="text-white text-sm">👤</span>
                </div>
                REVIEWS
              </Button>

              <Link href="/cart">
                <Button className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded relative font-bold">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  CART
                  {cartCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                      {cartCount}
                    </Badge>
                  )}
                </Button>
              </Link>

              {/* Admin Button for Desktop */}
              <Button
                onClick={() => setShowAdminLogin(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded font-bold"
              >
                <Settings className="w-5 h-5 mr-2" />
                ADMIN
              </Button>
            </div>
          </div>
        </header>

        {/* Desktop Main Content */}
        <div className="max-w-7xl mx-auto p-6">
          <div className="bg-white rounded-lg border-4 border-gray-400 overflow-hidden">
            <div className="flex">
              {/* Left Side - Video Section */}
              <div className="w-1/2 relative">
                <div className="relative h-96 bg-black">
                  <video 
                    src={currentVideo} 
                    autoPlay 
                    loop 
                    muted 
                    playsInline 
                    preload="auto"
                    onError={handleVideoError}
                    className="object-cover w-full h-full" 
                    key={currentVideo} // Force re-render when video changes
                  />
                  <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded font-bold">
                    VIDEO
                  </div>
                  <div className="absolute top-4 right-4 bg-green-600 text-white px-4 py-2 rounded font-bold">
                    BEST SELLER
                  </div>
                </div>

                <div className="p-6 bg-white">
                  <div className="bg-green-600 text-white px-4 py-2 rounded inline-block mb-4">
                    <h2 className="text-2xl font-bold">{currentDishName.toUpperCase()}</h2>
                  </div>

                  {selectedDish && <div className="flex items-center mb-4">{renderStars(selectedDish.rating)}</div>}

                  <p className="text-lg font-bold text-gray-800 uppercase leading-relaxed">{currentDescription}</p>
                </div>
              </div>

              {/* Right Side - Menu Section */}
              <div className="w-1/2 bg-gray-100">
                <div className="bg-green-600 text-white p-4">
                  <h2 className="text-3xl font-bold text-center">VEG MENU</h2>
                </div>

                <div className="p-6 space-y-4">
                  {filteredDishes.map((dish) => (
                    <div
                      key={dish.id}
                      className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-all ${
                        selectedDish?.id === dish.id
                          ? "bg-green-400 border-2 border-green-600"
                          : "bg-lime-300 hover:bg-lime-400"
                      }`}
                      onClick={() => handleDishClick(dish)}
                    >
                      <Image
                        src={dish.image || "/placeholder.svg"}
                        alt={dish.name}
                        width={60}
                        height={60}
                        className="rounded-lg object-cover"
                      />

                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800">{dish.name}</h3>
                      </div>

                      <div className="bg-green-700 text-white px-4 py-2 rounded font-bold text-lg">{dish.price}</div>

                      <Button
                        className={`w-10 h-10 rounded ${
                          selectedItems.has(dish.id)
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-gray-400 hover:bg-gray-500"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleItemSelect(dish.id)
                        }}
                      >
                        <Check className="w-5 h-5 text-white" />
                      </Button>
                    </div>
                  ))}

                  {selectedItems.size > 0 && (
                    <div className="flex items-center justify-center gap-4 mt-8 pt-6 border-t-2 border-gray-300">
                      <div className="bg-green-700 text-white px-6 py-3 rounded font-bold text-2xl">{quantity}</div>
                      <Button
                        className="bg-green-700 hover:bg-green-800 text-white px-8 py-3 rounded font-bold text-xl disabled:opacity-50"
                        onClick={handleAddToCart}
                        disabled={isLoading}
                      >
                        {isLoading ? "ADDING..." : "ADD TO CART"}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="block lg:hidden">
        {/* Mobile Header */}
        <header className="bg-gray-300 px-2 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-green-600 rounded border-2 border-green-800 flex items-center justify-center">
                <div className="w-5 h-5 bg-green-400 rounded-full"></div>
              </div>
              <h1 className="text-lg font-bold text-gray-800">HOTEL-VEG</h1>
            </div>

            <div className="flex items-center gap-2">
              {/* Search Icon */}
              <Button
                onClick={() => setShowSearchPopup(true)}
                className="bg-teal-400 hover:bg-teal-500 text-white p-2 rounded-full"
              >
                <Search className="w-4 h-4" />
              </Button>

              {/* Cart Button - Outside */}
              <Link href="/cart">
                <Button className="bg-orange-600 hover:bg-orange-700 text-white px-2 py-1 rounded text-xs relative">
                  <ShoppingCart className="w-3 h-3 mr-1" />
                  CART
                  {cartCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                      {cartCount}
                    </Badge>
                  )}
                </Button>
              </Link>

              {/* Settings Dropdown - Contains Order, Reviews, Admin */}
              <div className="relative">
                <Button
                  onClick={() => setShowMenuDropdown(!showMenuDropdown)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded text-xs flex items-center gap-1"
                >
                  <Settings className="w-3 h-3" />
                  <ChevronDown className="w-3 h-3" />
                </Button>
                {showMenuDropdown && (
                  <div className="absolute top-full right-0 mt-1 bg-white border-2 border-gray-300 rounded-lg shadow-lg z-50 min-w-40">
                    <button className="block w-full text-left px-3 py-2 hover:bg-gray-100 text-sm border-b border-gray-200">
                      <Phone className="w-3 h-3 inline mr-2" />
                      Call Order
                    </button>
                    <button className="block w-full text-left px-3 py-2 hover:bg-gray-100 text-sm border-b border-gray-200">
                      <MessageCircle className="w-3 h-3 inline mr-2" />
                      WhatsApp Order
                    </button>
                    <button className="block w-full text-left px-3 py-2 hover:bg-gray-100 text-sm border-b border-gray-200">
                      <User className="w-3 h-3 inline mr-2" />
                      Google Reviews
                    </button>
                    <button className="block w-full text-left px-3 py-2 hover:bg-gray-100 text-sm border-b border-gray-200">
                      <Star className="w-3 h-3 inline mr-2" />
                      Zomato Reviews
                    </button>
                    <button
                      onClick={() => {
                        setShowAdminLogin(true)
                        setShowMenuDropdown(false)
                      }}
                      className="block w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
                    >
                      <Settings className="w-3 h-3 inline mr-2" />
                      Admin Login
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Content */}
        <div className="p-3">
          {/* Video Section */}
          <div className="relative mb-4">
            <div className="relative w-full h-48 bg-black rounded-lg overflow-hidden">
              <video 
                src={currentVideo} 
                autoPlay 
                loop 
                muted 
                playsInline 
                preload="auto"
                onError={handleVideoError}
                className="object-cover w-full h-full" 
                key={currentVideo} // Force re-render when video changes
              />
              <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                VIDEO
              </div>
              <div className="absolute top-2 right-2 bg-green-600 text-white px-3 py-1 rounded font-bold text-sm">
                BEST SELLER
              </div>
            </div>

            <div className="mt-3 bg-green-600 text-white p-3 rounded">
              <h2 className="text-lg font-bold">{currentDishName}</h2>
              <p className="text-xs mt-1">{currentDescription}</p>
              {selectedDish && <div className="flex items-center mt-2">{renderStars(selectedDish.rating)}</div>}
            </div>
          </div>

          {/* Mobile Menu */}
          <div className="bg-white rounded-lg p-3 border-2 border-black">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-600 text-white px-4 py-2 rounded font-bold text-lg">VEG MENU</div>

              {/* Filter Dropdown */}
              <div className="relative">
                <Button
                  className="bg-gray-700 text-white px-4 py-2 rounded font-bold flex items-center gap-2"
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                >
                  FILTER
                  <ChevronDown className="w-4 h-4" />
                </Button>

                {showFilterDropdown && (
                  <div className="absolute top-full right-0 mt-1 bg-white border-2 border-gray-300 rounded-lg shadow-lg z-50 min-w-32">
                    {filters.map((filter) => (
                      <button
                        key={filter}
                        className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${
                          selectedFilter === filter ? "bg-gray-200 font-bold" : ""
                        }`}
                        onClick={() => {
                          setSelectedFilter(filter)
                          setShowFilterDropdown(false)
                        }}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              {filteredDishes.map((dish) => (
                <div
                  key={dish.id}
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all ${
                    selectedDish?.id === dish.id
                      ? "bg-green-400 border-2 border-blue-400"
                      : "bg-lime-300 hover:bg-lime-400"
                  }`}
                  onClick={() => handleDishClick(dish)}
                >
                  <Image
                    src={dish.image || "/placeholder.svg"}
                    alt={dish.name}
                    width={50}
                    height={50}
                    className="rounded-lg object-cover"
                  />

                  <div className="flex-1">
                    <h3 className="text-base font-bold text-gray-800">{dish.name}</h3>
                  </div>

                  <div className="bg-green-700 text-white px-3 py-1 rounded font-bold text-sm">{dish.price}</div>

                  <Button
                    className={`w-8 h-8 rounded ${
                      selectedItems.has(dish.id) ? "bg-green-600 hover:bg-green-700" : "bg-gray-400 hover:bg-gray-500"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleItemSelect(dish.id)
                    }}
                  >
                    <Check className="w-4 h-4 text-white" />
                  </Button>
                </div>
              ))}
            </div>

            {selectedItems.size > 0 && (
              <div className="flex items-center justify-center gap-3 mt-4">
                <div className="bg-green-700 text-white px-4 py-2 rounded font-bold text-lg">{quantity}</div>
                <Button
                  className="bg-green-700 hover:bg-green-800 text-white px-6 py-2 rounded font-bold text-base disabled:opacity-50"
                  onClick={handleAddToCart}
                  disabled={isLoading}
                >
                  {isLoading ? "ADDING..." : "ADD TO CART"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
