"use client";

import { motion } from "framer-motion";

const Contact = () => {
  return (
    <section
      id="Contact"
      className="py-24 bg-[#0b1120] text-white"
    >
      <div className="container mx-auto px-6 lg:px-20">
        
        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Get in Touch With{" "}
            <span className="text-cyan-500">Sentinel Cloud</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Have questions about our IoT cloud monitoring system? 
            Our team is ready to assist you.
          </p>
        </motion.div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* LEFT SIDE CONTENT */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h3 className="text-2xl font-semibold">
              Let’s Build Smart Monitoring Together
            </h3>

            <p className="text-gray-400 leading-relaxed">
              Sentinel Cloud provides secure, scalable, and intelligent IoT 
              monitoring solutions. Whether you are integrating devices or 
              building a monitoring dashboard, we are here to help.
            </p>

            <div className="space-y-4 text-gray-300">
              <p>📍 Location: Lucknow, India</p>
              <p>📧 Email: support@sentinelcloud.com</p>
              <p>📞 Phone: +91 XXXXX XXXXX</p>
            </div>
          </motion.div>

          {/* RIGHT SIDE CONTACT FORM */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="bg-gray-800/60 backdrop-blur-md border border-gray-700 p-8 rounded-2xl shadow-xl"
          >
            <form className="space-y-6">
              
              {/* Name */}
              <div>
                <label className="block text-sm mb-2 text-gray-300">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm mb-2 text-gray-300">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm mb-2 text-gray-300">
                  Subject
                </label>
                <input
                  type="text"
                  placeholder="Enter subject"
                  className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm mb-2 text-gray-300">
                  Message
                </label>
                <textarea
                  rows="4"
                  placeholder="Write your message..."
                  className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                ></textarea>
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="w-full bg-linear-to-r from-cyan-500 to-blue-500 hover:from-cyan-500 hover:to-blue-500 text-white py-3 rounded-xl font-semibold shadow-lg transition"
              >
                Send Message
              </motion.button>

            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
export default Contact;