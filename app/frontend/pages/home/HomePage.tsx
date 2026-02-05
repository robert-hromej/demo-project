import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { ChefHat, Search, DollarSign, Clock, Star, ArrowRight, Utensils } from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Search by Ingredients",
    description:
      "Enter the ingredients you have on hand, and we'll find recipes you can make right now.",
    href: "/search/ingredients",
    color: "text-blue-500",
    bgColor: "bg-blue-50",
  },
  {
    icon: DollarSign,
    title: "Search by Budget",
    description: "Set your budget and discover delicious meals that won't break the bank.",
    href: "/search/budget",
    color: "text-green-500",
    bgColor: "bg-green-50",
  },
  {
    icon: Utensils,
    title: "Browse Recipes",
    description: "Explore our collection of recipes, filter by category, difficulty, and more.",
    href: "/recipes",
    color: "text-orange-500",
    bgColor: "bg-orange-50",
  },
];

const highlights = [
  {
    icon: Clock,
    value: "Quick & Easy",
    description: "Recipes with preparation time estimates",
  },
  {
    icon: Star,
    value: "Community Rated",
    description: "Find the best recipes based on user ratings",
  },
  {
    icon: DollarSign,
    value: "Cost Estimates",
    description: "Know the approximate cost before you cook",
  },
];

export default function HomePage() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-12 md:py-20">
        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-full bg-orange-100">
            <ChefHat className="h-16 w-16 text-orange-500" />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Welcome to <span className="text-orange-500">RecipeMatch</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          Find the perfect recipe based on what you have in your kitchen or your budget. Cooking
          made easy!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/search/ingredients">
            <Button size="lg" leftIcon={<Search className="h-5 w-5" />}>
              Search by Ingredients
            </Button>
          </Link>
          <Link to="/recipes">
            <Button variant="outline" size="lg" leftIcon={<Utensils className="h-5 w-5" />}>
              Browse Recipes
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section>
        <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-8">
          How It Works
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link key={feature.href} to={feature.href} className="group">
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardBody>
                    <div className={`inline-flex p-3 rounded-lg ${feature.bgColor} mb-4`}>
                      <Icon className={`h-6 w-6 ${feature.color}`} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 mb-4">{feature.description}</p>
                    <span className="inline-flex items-center text-sm font-medium text-orange-600 group-hover:gap-2 transition-all">
                      Get started
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </span>
                  </CardBody>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Highlights Section */}
      <section className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-gray-100">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-8">
          Why RecipeMatch?
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {highlights.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="text-center">
                <div className="inline-flex p-3 rounded-full bg-orange-100 mb-4">
                  <Icon className="h-6 w-6 text-orange-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.value}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center py-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl text-white">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Start Cooking?</h2>
        <p className="text-lg text-orange-100 mb-6 max-w-xl mx-auto">
          Join our community and discover new recipes tailored to your needs.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/register">
            <Button
              variant="outline"
              size="lg"
              className="bg-white text-orange-600 border-white hover:bg-orange-50"
            >
              Create Account
            </Button>
          </Link>
          <Link to="/recipes">
            <Button
              variant="ghost"
              size="lg"
              className="text-white hover:bg-orange-600"
              rightIcon={<ArrowRight className="h-5 w-5" />}
            >
              Explore Recipes
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
