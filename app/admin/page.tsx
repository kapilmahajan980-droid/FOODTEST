"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Upload, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { storeDish, compressImage, getAllDishes, deleteDish as removeFromDB } from "@/lib/storage"

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

export default function AdminPage() {
  const [dishName, setDishName] = useState("")
  const [category, setCategory] = useState("")
  const [price, setPrice] = useState("")
  const [description, setDescription] = useState("")
  const [rating, setRating] = useState(0)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null) // Changed from gifFile to videoFile
  const [dishes, setDishes] = useState<Dish[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const categories = ["Spicy", "Jain", "Low Oil", "Chef Special"]

  useEffect(() => {
    const loadDishes = async () => {
      try {
        const dishesFromDB = await getAllDishes()
        setDishes(dishesFromDB)
      } catch (error) {
        console.error('Error loading dishes:', error)
      }
    }
    loadDishes()
  }, [])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0])
    }
  }

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setVideoFile(file)
    }
  }

  const handleAddDish = async () => {
    if (!dishName || !category || !price || !description || rating === 0) {
      alert("Please fill all fields")
      return
    }

    setIsLoading(true)

    // Convert image and video to compressed blobs if uploaded
    const imageBlob = imageFile ? await compressImage(imageFile) : null
    const videoBlob = videoFile ? videoFile : null

    const newDish = {
      id: Date.now().toString(),
      name: dishName,
      category,
      price: parseInt(price),
      description,
      rating,
      image: imageBlob ? URL.createObjectURL(imageBlob) : "/images/matar-paneer.webp",
      video: videoBlob ? URL.createObjectURL(videoBlob) : "/gifs/hotel-branding.gif",
      imageBlob,
      videoBlob,
    }

    try {
      // Store the dish using IndexedDB
      await storeDish(newDish)
      setDishes([...dishes, newDish])

      // Reset form
      setDishName("")
      setCategory("")
      setPrice("")
      setDescription("")
      setRating(0)
      setImageFile(null)
      setVideoFile(null)
      alert("Dish added successfully!")
    } catch (error) {
      console.error('Error storing dish:', error)
      alert('Failed to add dish. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }


  const handleRemoveDish = async (dishId: string) => {
    try {
      await removeFromDB(dishId)
      const updatedDishes = dishes.filter((dish) => dish.id !== dishId)
      setDishes(updatedDishes)
    } catch (error) {
      console.error('Error removing dish:', error)
      alert('Failed to remove dish.')
    }
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
              <h1 className="text-4xl font-bold text-gray-800">ADMIN DASHBOARD</h1>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded font-bold">
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center mr-2">
                    <span className="text-blue-600 text-sm">🏠</span>
                  </div>
                  BACK TO HOME
                </Button>
              </Link>

              <Link href="/cart">
                <Button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded font-bold">
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center mr-2">
                    <span className="text-green-600 text-sm">🛒</span>
                  </div>
                  VIEW CART
                </Button>
              </Link>

              <a href="tel:8788477859" className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded font-bold">
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center mr-2">
                  <span className="text-gray-600 text-sm">📞</span>
                </div>
                CALL: 8788477859
              </a>

              <Button className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded font-bold">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-2">
                  <span className="text-white text-sm">👤</span>
                </div>
                HELLO, ADMIN
              </Button>
            </div>
          </div>
        </header>

        {/* Desktop Form */}
        <div className="max-w-7xl mx-auto p-6">
          <div className="bg-white rounded-lg border-4 border-gray-400 p-8">
            <h2 className="text-4xl font-bold text-green-700 mb-8">ADD DISH</h2>

            <div className="grid grid-cols-2 gap-12">
              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <label className="block text-xl font-bold text-gray-800 mb-3">Dish Name</label>
                  <Input
                    value={dishName}
                    onChange={(e) => setDishName(e.target.value)}
                    className="w-full p-4 border-2 border-gray-300 rounded text-lg"
                    placeholder="Enter dish name"
                  />
                </div>

                <div>
                  <label className="block text-xl font-bold text-gray-800 mb-3">Dish Category</label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="w-full p-4 border-2 border-gray-300 rounded text-lg h-14">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-lg font-bold text-gray-800 mb-3">UPLOAD DISH IMAGE</label>
                    <label className="block">
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      <div className="bg-green-700 hover:bg-green-800 text-white px-6 py-4 rounded cursor-pointer text-center font-bold">
                        <Upload className="w-6 h-6 mx-auto mb-2" />
                        UPLOAD
                      </div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-lg font-bold text-gray-800 mb-3">UPLOAD VIDEO</label>{" "}
                    {/* Changed text */}
                    <label className="block">
                      <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />{" "}
                      {/* Changed accept and handler */}
                      <div className="bg-green-700 hover:bg-green-800 text-white px-6 py-4 rounded cursor-pointer text-center font-bold">
                        <Upload className="w-6 h-6 mx-auto mb-2" />
                        UPLOAD
                      </div>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xl font-bold text-gray-800 mb-3">Price</label>
                  <Input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full p-4 border-2 border-gray-300 rounded text-lg"
                    placeholder="Enter price"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div>
                  <label className="block text-xl font-bold text-gray-800 mb-3">Price</label>
                  <Input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full p-4 border-2 border-gray-300 rounded text-lg"
                    placeholder="Enter price"
                  />
                </div>

                <div>
                  <label className="block text-xl font-bold text-gray-800 mb-3">Short Description</label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-4 border-2 border-gray-300 rounded text-lg h-32"
                    placeholder="Enter description"
                  />
                </div>

                <div>
                  <label className="block text-xl font-bold text-gray-800 mb-3">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} onClick={() => setRating(star)} className="p-1">
                        <Star
                          className={`w-8 h-8 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-300 text-gray-300"}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-8">
                  <Button
                    onClick={handleAddDish}
                    className="bg-green-700 hover:bg-green-800 text-white px-12 py-4 rounded font-bold text-xl w-full disabled:opacity-50"
                    disabled={isLoading}
                  >
                    {isLoading ? "ADDING DISH..." : "ADD"}
                  </Button>
                </div>
              </div>
            </div>

            {dishes.length > 0 && (
              <div className="mt-12 pt-8 border-t-2 border-gray-300">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Existing Dishes</h3>
                <div className="grid grid-cols-2 gap-4">
                  {dishes.map((dish) => (
                    <div key={dish.id} className="flex items-center justify-between p-4 bg-gray-100 rounded border">
                      <div>
                        <h4 className="font-bold text-lg">{dish.name}</h4>
                        <p className="text-gray-600">
                          {dish.category} - ₹{dish.price}
                        </p>
                      </div>
                      <Button
                        onClick={() => handleRemoveDish(dish.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
              <h1 className="text-base font-bold text-gray-800">ADMIN DASHBOARD</h1>
            </div>

            <div className="flex items-center gap-1">
              <Link href="/">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs">🏠 HOME</Button>
              </Link>

              <Link href="/cart">
                <Button className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs">
                  🛒 CART
                </Button>
              </Link>

              <a href="tel:8788477859" className="bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded text-xs">
                📞 CALL
              </a>

              <Button className="bg-orange-600 hover:bg-orange-700 text-white px-2 py-1 rounded text-xs">ADMIN</Button>
            </div>
          </div>
        </header>

        {/* Mobile Form */}
        <div className="p-3">
          <h2 className="text-2xl font-bold text-green-700 mb-4">ADD DISH</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-base font-bold text-gray-800 mb-2">Dish Name</label>
              <Input
                value={dishName}
                onChange={(e) => setDishName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded text-base"
                placeholder="Enter dish name"
              />
            </div>

            <div>
              <label className="block text-base font-bold text-gray-800 mb-2">Dish Category</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full p-2 border border-gray-300 rounded text-base">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">UPLOAD DISH IMAGE</label>
                <label className="block">
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  <div className="bg-green-700 hover:bg-green-800 text-white px-3 py-2 rounded cursor-pointer text-center font-bold text-xs">
                    <Upload className="w-3 h-3 mx-auto mb-1" />
                    UPLOAD
                  </div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">UPLOAD VIDEO</label> {/* Changed text */}
                <label className="block">
                  <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />{" "}
                  {/* Changed accept and handler */}
                  <div className="bg-green-700 hover:bg-green-800 text-white px-3 py-2 rounded cursor-pointer text-center font-bold text-xs">
                    <Upload className="w-3 h-3 mx-auto mb-1" />
                    UPLOAD
                  </div>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-base font-bold text-gray-800 mb-2">Price</label>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded text-base"
                placeholder="Enter price"
              />
            </div>

            <div>
              <label className="block text-base font-bold text-gray-800 mb-2">Short Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded text-base h-20"
                placeholder="Enter description"
              />
            </div>

            <div>
              <label className="block text-base font-bold text-gray-800 mb-2">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} onClick={() => setRating(star)} className="p-1">
                    <Star
                      className={`w-5 h-5 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-300 text-gray-300"}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="text-center">
              <Button
                onClick={handleAddDish}
                className="bg-green-700 hover:bg-green-800 text-white px-6 py-2 rounded font-bold text-base disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? "ADDING..." : "ADD"}
              </Button>
            </div>
          </div>

          {dishes.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-bold text-gray-800 mb-3">Existing Dishes</h3>
              <div className="space-y-2">
                {dishes.map((dish) => (
                  <div key={dish.id} className="flex items-center justify-between p-2 bg-white rounded border">
                    <div>
                      <h4 className="font-bold text-sm">{dish.name}</h4>
                      <p className="text-gray-600 text-xs">
                        {dish.category} - ₹{dish.price}
                      </p>
                    </div>
                    <Button
                      onClick={() => handleRemoveDish(dish.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
