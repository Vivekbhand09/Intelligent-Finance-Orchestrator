import {assets} from "../assets/assets.js";

const ProductShowcase = () => {
    return (
        <section className="pb-20 md:pb-32">
            <div className="container mx-auto px-8 sm:px-16 md:px-24 lg:px-32">
                <img
                    src={assets.landing}
                    className="w-full h-auto object-cover rounded-lg shadow-xl"
                    alt="MoneyWise App Dashboard"
                    onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/1200x600/E2E8F0/4A5568?text=Image+Not+Found'; }}
                />
            </div>
        </section>
    );
};

export default ProductShowcase;