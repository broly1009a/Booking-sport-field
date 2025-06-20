import React, { useState } from "react";
import { FaInstagram, FaTwitter, FaFacebook, FaClock, FaMoneyBillWave, FaFootballBall, FaCalendarCheck } from "react-icons/fa";

const Home = () => {
    const [email, setEmail] = useState("");

    const features = [
        { icon: <FaCalendarCheck />, title: "Instant Booking", description: "Book your pitch in under 2 minutes" },
        { icon: <FaFootballBall />, title: "Multiple Pitch Options", description: "Choose from grass, turf or indoor pitches" },
        { icon: <FaMoneyBillWave />, title: "Transparent Pricing", description: "Clear pricing with no hidden fees" },
        { icon: <FaClock />, title: "24/7 Availability", description: "Book anytime, day or night" }
    ];

    const testimonials = [
        { name: "John Smith", quote: "Best booking experience ever! Got my preferred pitch instantly.", rating: 5, image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e" },
        { name: "Sarah Johnson", quote: "Fantastic facilities and super easy booking process.", rating: 5, image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330" },
        { name: "Mike Wilson", quote: "Great value for money and excellent customer service.", rating: 4, image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d" }
    ];

    const partners = [
        { name: "Stadium A", logo: "https://images.unsplash.com/photo-1522778119026-d647f0596c20" },
        { name: "Stadium B", logo: "https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9" },
        { name: "Stadium C", logo: "https://images.unsplash.com/photo-1516802273409-68526ee1bdd6" },
        { name: "Stadium D", logo: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6" },
        { name: "Stadium E", logo: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c" },
        { name: "Stadium F", logo: "https://images.unsplash.com/photo-1511886929837-354d827aae26" }
    ];

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <div className="relative h-[80vh] flex items-center justify-center">
                <img
                    src="https://images.unsplash.com/photo-1522778034537-20a2486be803"
                    alt="Football Pitch"
                    className="absolute inset-0 w-full h-full object-cover z-0"
                />
                <div className="absolute inset-0 bg-black/50 z-10"></div>
                <div className="relative z-20 text-center px-4">
                    <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">Book your football pitch in seconds</h1>
                    <p className="text-xl md:text-2xl text-white mb-8">Experience seamless booking for the best football pitches in your area</p>
                    <button className="bg-green-500 hover:bg-green-600 text-white text-xl font-bold py-4 px-8 rounded-full transition duration-300">Book Now</button>
                </div>
            </div>

            {/* Features Section */}
            <div className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                        {features.map((feature, index) => (
                            <div key={index} className="text-center p-6 rounded-lg hover:shadow-xl transition duration-300">
                                <div className="text-4xl text-green-500 mb-4 flex justify-center">{feature.icon}</div>
                                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                                <p className="text-gray-600">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Testimonials Section */}
            <div className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-6">
                    <h2 className="text-4xl font-bold text-center mb-12">What Our Customers Say</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <div key={index} className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition duration-300">
                                <div className="flex items-center mb-4">
                                    <img src={testimonial.image} alt={testimonial.name} className="w-12 h-12 rounded-full object-cover" />
                                    <div className="ml-4">
                                        <h4 className="font-bold">{testimonial.name}</h4>
                                        <div className="flex text-yellow-400">
                                            {[...Array(testimonial.rating)].map((_, i) => (
                                                <span key={i}>★</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <p className="text-gray-600 italic">"{testimonial.quote}"</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Partners Section */}
            <div className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <h2 className="text-4xl font-bold text-center mb-12">Our Partner Stadiums</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
                        {partners.map((partner, index) => (
                            <div key={index} className="grayscale hover:grayscale-0 transition duration-300">
                                <img src={partner.logo} alt={partner.name} className="w-full h-24 object-contain" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <h3 className="text-xl font-bold mb-4">About Us</h3>
                            <p className="text-gray-400">Your trusted platform for football pitch bookings</p>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
                            <ul className="space-y-2">
                                <li><a href="#" className="text-gray-400 hover:text-white">About</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white">Contact</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white">FAQ</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-4">Follow Us</h3>
                            <div className="flex space-x-4">
                                <FaFacebook className="text-2xl cursor-pointer hover:text-green-500" />
                                <FaTwitter className="text-2xl cursor-pointer hover:text-green-500" />
                                <FaInstagram className="text-2xl cursor-pointer hover:text-green-500" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-4">Newsletter</h3>
                            <div className="flex max-w-md mx-auto shadow-md rounded-lg overflow-hidden">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    className="px-4 py-2 bg-white text-black w-full outline-none"
                                />
                                <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 transition duration-300">
                                    Subscribe
                                </button>
                            </div>

                        </div>
                    </div>
                    <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
                        <p>© 2024 Football Pitch Booking. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;