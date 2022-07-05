export class ProductVariant {
    public ProductName: string;
    // public attributeID: number;
    // public variantID: number;
    SortOrder?: string | number = 0;
    public action: string
    public productID: number;
    public isRequiredAttributeValue: boolean;
    public isRequiredAttribute: boolean;
    productAttribute: ProductAttribute = null;
    attributeValue: any = [];
    attributeValuesDD: any = [];
    productAttributeDD: any = [];
}

export class SearchProductVariant {
    public branchID: number = null;
    public variantID: number = null;
    public productVariantID: number = null;
    public pageNumber: number = 1;
    public pageSize: number = 10;
}


// product variant for 
// export class ProductVariant {
//     productAttribute: ProductAttribute
//     attributeValue: AttributeValue[]
// }

export class ProductAttribute {
    public AttributeID: number;
    public ProductAttributeValueID: number;
    public AttributeName: string;
    public SortOrder: number
}

export class AttributeValue {
    public AttributeValue: string = "";
    public AttributeValueID: number = 0;
    public AttributeID: number = 0;
    public ProductAttributeID: number = 0;
    public ProductAttributeValueID: number = 0;
    public SortOrder: number = 0;
}