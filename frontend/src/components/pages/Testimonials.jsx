"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const testimonials = [
  {
    id: 1,
    name: "Lab Supervisor",
    image: "/images/1.jpg",
    message:
      "Sentinel Cloud helped us monitor environmental conditions in real-time and reduced manual checking by 80%.",
  },
  {
    id: 2,
    name: "Industrial Safety Officer",
    image: "/images/2.jpg",
    message:
      "The alert system is extremely useful. We get instant notifications when gas levels rise beyond safe limits.",
  },
  {
    id: 3,
    name: "Engineering Faculty",
    image: "/images/3.jpg",
    message:
      "This platform is perfect for academic IoT projects and real-world implementation.",
  },
];

const Testimonials = () => {
  return (
    <section
      id="testimonials"
      className="py-24 bg-[#0b0f1a] text-white"
    >
      <div className="container mx-auto px-6 lg:px-20 text-center">
        
        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-bold mb-4"
        >
          What Users Say About{" "}
          <span className="text-cyan-500">Sentinel Cloud</span>
        </motion.h2>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-gray-400 max-w-2xl mx-auto mb-16"
        >
          Real feedback from professionals using our IoT cloud monitoring system.
        </motion.p>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              className="bg-gray-800/60 backdrop-blur-md border border-gray-700 rounded-2xl p-8 shadow-xl"
            >
              <div className="flex justify-center mb-4">
                <Image
                  src={item.image}
                  alt={item.name}
                  width={80}
                  height={80}
                  className="rounded-full object-cover border-2 border-cyan-500"
                />
              </div>

              <p className="text-gray-300 mb-6 text-sm md:text-base leading-relaxed">
                “{item.message}”
              </p>

              <h4 className="text-cyan-500 font-semibold">
                {item.name}
              </h4>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
export default Testimonials;