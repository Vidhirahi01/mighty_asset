export type RequestPriority = 'high' | 'medium' | 'low';

export type AssignmentType = 'permanent' | 'temporary' | 'project';

export type AccessoryOption = 'charger' | 'plug' | 'cable' | 'bag' | 'mouse' | 'keyboard';

export type AssetRequest = {
    id: string;
    requestDate: string;
    quantity: number;
    priority: RequestPriority;
    requesterName: string;
    employeeId: string;
    department: string;
    role: string;
    reason: string;
    preferredCategory: string;
};

export type AssetOption = {
    id: string;
    name: string;
    category: string;
    modelNo: string;
    serialNo: string;
    status: 'available' | 'assigned' | 'inRepair';
};

export type AssignPayload = {
    requestId: string;
    assetId: string;
    assignDate: string;
    assignmentType: AssignmentType;
    expectedReturn: string | null;
    notes: string;
    accessories: AccessoryOption[];
};
