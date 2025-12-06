import React from "react";
import "./WhyChooseUs.css";

const features = [
  {
    id: 1,
    title: "Interactive Courses",
    description:
      "Engage with dynamic content, quizzes, and multimedia resources designed for effective learning.",
    color: "#7B9EFF",
  },
  {
    id: 2,
    title: "Student Dashboard",
    description:
      "Track your progress, manage assignments, and stay organized with our intuitive student portal.",
    color: "#9E7BFF",
  },
  {
    id: 3,
    title: "Expert Instructors",
    description:
      "Learn from industry professionals and certified educators with years of teaching experience.",
    color: "#F6A3FF",
  },
  {
    id: 4,
    title: "Flexible Schedule",
    description:
      "Access your courses anytime, anywhere, and learn at your own pace with flexible scheduling.",
    color: "#FF7B7B",
  },
  {
    id: 5,
    title: "Certification",
    description:
      "Earn certificates upon course completion to showcase your achievements and skills.",
    color: "#7BCFFF",
  },
  {
    id: 6,
    title: "Community Support",
    description:
      "Join a global learning community and collaborate with peers and mentors across the world.",
    color: "#6BEB8C",
  },
];

const WhyChooseUs = () => {
  return (
    <section className="why-container">
      <h2 className="why-title">Why Choose Our Platform?</h2>
      <p className="why-subtitle">
        Discover the features that make our Learning Management System the
        perfect choice for students, educators, and institutions worldwide.
      </p>

      <div className="features-grid">
        {features.map((feature) => (
          <div className="feature-card" key={feature.id}>
            <div
              className="feature-number"
              style={{ background: feature.color }}
            >
              {feature.id}
            </div>
            <h3 className="feature-title">{feature.title}</h3>
            <p className="feature-description">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WhyChooseUs;
