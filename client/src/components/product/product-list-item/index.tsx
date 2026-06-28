import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Divider } from 'primereact/divider';

import { API_BASE_URL } from "@/lib/axios";
import { type IProduct, getEffectivePrice, getDiscountPercentage } from '@/types/product';
import { useWishlist } from '@/hooks/use-wishlist';

import './ProductListItem.css';

interface ProductListItemProps {
    product: IProduct;
    showDivider: boolean;
    onAddToCart: (e: React.MouseEvent, product: IProduct) => void;
}

export function ProductListItem({ 
    product, 
    showDivider, 
    onAddToCart 
}: ProductListItemProps) {
    const navigate = useNavigate();
    
    const { inWishlist, toggleWishlist, wishlistLoading } = useWishlist(product);

    const getInventoryStatus = (stock: number) => {
        if (stock === 0) return { label: 'ESGOTADO', severity: 'danger' };
        if (stock < 5) return { label: 'POUCAS UNIDADES', severity: 'warning' };
        return { label: 'EM ESTOQUE', severity: 'success' };
    };

    const stockInfo = getInventoryStatus(product.stock);

    return (
        <div className="col-12">
            {showDivider && <Divider className="m-0" />}

            <div 
                className="search-responsive-container cursor-pointer"
                onClick={() => navigate(`/products/${product.id}`)}
            >
                {/* Imagem */}
                <div className="search-image-wrapper shadow-2">
                    <img 
                        src={`${API_BASE_URL}${product.imageUrl}`} 
                        alt={product.name} 
                        className="search-item-img"
                    />
                    {product.promo && (
                        <Tag 
                            value={`${getDiscountPercentage(product)}% OFF`} 
                            severity="success" 
                            className="absolute font-bold" 
                            style={{ top: "4px", left: "4px", fontSize: "0.7rem" }} 
                        />
                    )}
                </div>

                {/* Detalhes */}
                <div className="search-item-details">
                    <h3 className="search-item-name">{product.name}</h3>
                    
                    <div className="search-item-category">
                        <i className="pi pi-tag"></i>
                        <span>{product.category?.name || 'Geral'}</span>
                    </div>

                    <Tag value={stockInfo.label} severity={stockInfo.severity as any} className="w-max" />
                </div>

                {/* Ações (Direita) */}
                <div className="search-item-actions">
                    <div className="search-price-desktop flex flex-column align-items-end gap-1">
                        {product.promo && product.discountType && product.discountValue !== undefined ? (
                            <>
                                <span className="text-sm line-through m-0" style={{ color: '#888888' }}>
                                    R$ {product.price.toFixed(2)}
                                </span>
                                <span className="text-2xl font-bold text-primary m-0">
                                    R$ {getEffectivePrice(product).toFixed(2)}
                                </span>
                            </>
                        ) : (
                            <span className="text-2xl font-bold text-900 m-0">
                                R$ {product.price.toFixed(2)}
                            </span>
                        )}
                    </div>

                    <div className="action-buttons-wrapper">
                        <Button 
                            icon={inWishlist ? "pi pi-heart-fill" : "pi pi-heart"} 
                            className={`btn-circle-action heart ${inWishlist ? 'btn-circle-action heartfill' : 'btn-circle-action heart'}`}
                            tooltip="Salvar na Lista de Desejos"
                            tooltipOptions={{ position: 'bottom' }}
                            onClick={toggleWishlist} 
                            loading={wishlistLoading}
                        />

                        <Button 
                            icon="pi pi-shopping-cart" 
                            className="btn-circle-action cart" 
                            tooltip="Adicionar ao Carrinho"
                            tooltipOptions={{ position: 'bottom' }}
                            disabled={product.stock === 0}
                            onClick={(e) => onAddToCart(e, product)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}