import { useEffect, useState } from 'react';
import { Carousel } from 'primereact/carousel';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '@/lib/axios';
import CarouselService from '@/services/carousel-service';

import './BannerCarousel.css';

interface Banner {
    id: number;
    productId?: number;
    imageUrl: string;
    alt: string;
}

export const BannerCarousel = () => {
    const navigate = useNavigate();
    const [banners, setBanners] = useState<Banner[]>([]);

    useEffect(() => {
        loadBanners();
    }, []);

    const loadBanners = async () => {
        const response = await CarouselService.findAll();
        if (response.success && Array.isArray(response.data)) {
            setBanners(response.data);
        }
    };

    const itemTemplate = (banner: Banner) => {
        return (
            <div 
                className="banner-wrapper cursor-pointer" 
                onClick={() => banner.productId && navigate(`/products/${banner.productId}`)}
            >
                <img 
                    src={`${API_BASE_URL}${banner.imageUrl}`} 
                    alt={banner.alt} 
                    className="banner-image"
                />
            </div>
        );
    };

    if (banners.length === 0) return null;

    return (
        <div className="banner-carousel mb-5">
            <Carousel 
                value={banners} 
                numVisible={1} 
                numScroll={1} 
                circular 
                autoplayInterval={5000} 
                itemTemplate={itemTemplate}
                showIndicators={true}
                showNavigators={true}
            />
        </div>
    );
};