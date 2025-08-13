"use client"

import { useState, useEffect } from "react"
import { Search, Home, Check, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import Image from "next/image"

interface CartItem {
  id: string
  name: string
  price: number
  image: string
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [includeGST, setIncludeGST] = useState(true)

  useEffect(() => {
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      setCartItems(JSON.parse(savedCart))
    }
  }, [])

  const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0)
  const gstAmount = includeGST ? Math.round(subtotal * 0.18) : 0
  const total = subtotal + gstAmount

  const removeItem = (itemId: string) => {
    const updatedCart = cartItems.filter((item) => item.id !== itemId)
    setCartItems(updatedCart)
    localStorage.setItem("cart", JSON.stringify(updatedCart))
  }

  return (
    <div className="min-h-screen bg-gray-200">
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
              <Link href="/">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded font-bold">
                  <Home className="w-5 h-5 mr-2" />
                  BACK TO MENU
                </Button>
              </Link>

              <div className="relative">
                <Input
                  placeholder="SEARCH DISH"
                  className="w-96 h-12 bg-white border-4 border-green-400 rounded-full pl-6 pr-16 text-lg font-medium"
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-green-400 rounded-full flex items-center justify-center">
                  <Search className="w-5 h-5 text-white" />
                </div>
              </div>

              <a
                href="tel:8788477859"
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded font-bold flex items-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                <span>ORDER: 8788477859</span>
              </a>
            </div>
          </div>
        </header>

        {/* Desktop Cart Content */}
        <div className="max-w-6xl mx-auto p-6">
          <div className="bg-white rounded-lg border-4 border-gray-400 overflow-hidden">
            <div className="bg-green-600 text-white p-6">
              <h1 className="text-4xl font-bold text-center">ORDER SUMMARY</h1>
            </div>

            <div className="p-8">
              {cartItems.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-2xl text-gray-600">Your cart is empty</p>
                  <Link href="/">
                    <Button className="mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded">
                      Continue Shopping
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {cartItems.map((item, index) => (
                    <div key={`${item.id}-${index}`} className="flex items-center gap-6 py-4">
                      <Button
                        className="w-8 h-8 bg-black hover:bg-gray-800 text-white rounded border-2 border-black"
                        onClick={() => removeItem(item.id)}
                      >
                        <Check className="w-4 h-4" />
                      </Button>

                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        width={80}
                        height={80}
                        className="rounded-lg object-cover"
                      />

                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-800">{item.name}</h3>
                      </div>

                      <div className="bg-green-700 text-white px-6 py-3 rounded font-bold text-2xl">{item.price}</div>
                    </div>
                  ))}

                  <hr className="border-t-2 border-gray-300 my-6" />

                  <div className="flex items-center gap-6 py-4">
                    <Button
                      className={`w-8 h-8 rounded border-2 border-black ${includeGST ? "bg-black text-white" : "bg-white text-black"}`}
                      onClick={() => setIncludeGST(!includeGST)}
                    >
                      <Check className="w-4 h-4" />
                    </Button>

                    <span className="text-2xl font-bold">Include GST</span>

                    <div className="flex-1"></div>

                    <span className="text-2xl font-bold">Total</span>

                    <div className="bg-green-700 text-white px-6 py-3 rounded font-bold text-2xl">{total}</div>
                  </div>
                </div>
              )}
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
              <div className="relative">
                <Input
                  placeholder="SEARCH DISH"
                  className="w-32 h-8 bg-teal-100 border border-teal-400 rounded-full pl-3 pr-8 text-sm"
                />
                <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-teal-600" />
              </div>

              <Link href="/">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs">
                  <Home className="w-3 h-3 mr-1" />
                  BACK
                </Button>
              </Link>

              <a
                href="tel:8788477859"
                className="bg-orange-600 hover:bg-orange-700 text-white px-2 py-1 rounded text-xs"
              >
                📞 CALL
              </a>
            </div>
          </div>
        </header>

        {/* Mobile Cart Content */}
        <div className="p-3">
          <div className="bg-green-600 text-white px-4 py-3 rounded-t-lg">
            <h1 className="text-xl font-bold">YOUR CART</h1>
          </div>

          <div className="bg-white p-4 rounded-b-lg border-2 border-black border-t-0">
            {cartItems.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-lg text-gray-600">Your cart is empty</p>
                <Link href="/">
                  <Button className="mt-3 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {cartItems.map((item, index) => (
                  <div key={`${item.id}-${index}`} className="flex items-center gap-3 py-2">
                    <Button
                      className="w-6 h-6 bg-black hover:bg-gray-800 text-white rounded border border-black"
                      onClick={() => removeItem(item.id)}
                    >
                      <Check className="w-3 h-3" />
                    </Button>

                    <Image
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      width={50}
                      height={50}
                      className="rounded-lg object-cover"
                    />

                    <div className="flex-1">
                      <h3 className="text-base font-bold text-gray-800">{item.name}</h3>
                    </div>

                    <div className="bg-green-700 text-white px-3 py-1 rounded font-bold text-sm">{item.price}</div>
                  </div>
                ))}

                <hr className="border-t border-gray-300 my-3" />

                <div className="flex items-center gap-3 py-2">
                  <Button
                    className={`w-6 h-6 rounded border border-black ${includeGST ? "bg-black text-white" : "bg-white text-black"}`}
                    onClick={() => setIncludeGST(!includeGST)}
                  >
                    <Check className="w-3 h-3" />
                  </Button>

                  <span className="text-base font-bold">Include GST</span>

                  <div className="flex-1"></div>

                  <span className="text-base font-bold">Total</span>

                  <div className="bg-green-700 text-white px-3 py-1 rounded font-bold text-base">{total}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
