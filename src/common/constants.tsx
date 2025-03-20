export class Controllers {
  static Auth = {
    name: "AuthService",
    methods: {
      login: {
        name: "Login",
      },
      logout: {
        name: "Logout",
      },
    },
  };
  static User = {
    name: "UserService",
    methods: {
      registerUser: {
        name: "AddUser",
      },
      getUserList: {
        name: "GetUserList",
      },
      createUserRole: {
        name: "AddUserRole",
      },
      getUserRoleList: {
        name: "GetUserRoles",
      },
      removeUserRole: {
        name: "RemoveUserRole",
      },
    },
  };
  static SysAdmin = {
    name: "SystemAdmin",
    methods: {
      getSystemAdminList: {
        name: "GetSystemAdminsList",
      },
      addSystemAdmin: {
        name: "AddSystemAdmin",
      },
      removeSystemAdmin: {
        name: "RemoveSystemAdmin",
      },
    },
  };
  static Product = {
    name: "ProductService",
    methods: {
      getProductList: {
        name: "GetProductList",
      },
    },
  };
  static Workflow = {
    name: "WorkflowService",
    methods: {
      getWorkflowStages: {
        name: "GetWorkflowStages",
      },
      getAssignedWorkflowStages: {
        name: "GetAssignedWorkflowStages",
      },
      assignWorkflowStages: {
        name: "AssignWorkflowStages",
      },
      getWorkflowStagUsers: {
        name: "GetWorkflowStagUsers",
      },
      addWorkflowStageUser: {
        name: "AddWorkflowStageUser",
      },
      removeWorkflowStageUser: {
        name: "RemoveWorkflowStageUser",
      },
      deleteWorkflowStage: {
        name: "DeleteWorkflowStage",
      },
      createWorkflowStage: {
        name: "CreateWorkflowStage",
      },
      updateWorkflowStage: {
        name: "UpdateWorkflowStage",
      },
    },
  };
  static ExportOrder = {
    name: "ExportOrder",
    methods: {
      getExportOrders: {
        name: "GetExportOrders",
      },
      createExportOrder: {
        name: "CreateExportOrder",
      },
      viewExportOrder: {
        name: "ViewExportOrder",
      },
      deleteExportOrder: {
        name: "DeleteExportOrder",
      },
      updateExportOrderNft: {
        name: "UpdateExportOrderNft",
      },
    },
  };
  static Batch = {
    name: "Batch",
    methods: {
      getBatches: {
        name: "GetBatches",
      },
      createBatch: {
        name: "CreateBatch",
      },
      viewBatch: {
        name: "ViewBatch",
      },
      deleteBatch: {
        name: "DeleteBatch",
      },
    },
  };
  static BatchHistory = {
    name: "BatchHistory",
    methods: {
      getBatchHistoryByReference: {
        name: "GetBatchHistoryByReference",
      },
      getHistoryByExportOrderReference: {
        name: "GetHistoryByExportOrderReference",
      },
      recordBatchHistory: {
        name: "RecordBatchHistory",
      },
    },
  };
  static Metadata = {
    name: "MetadataService",
    methods: {
      getMetadata: {
        name: "GetMetadata",
      },
    },
  };
}

export class Claims {
  static ScanUnit = 1;
  static UserManage = 2;
  static StageManage = 3;
  static BatchManage = 4;
  static TenantManage = 5;
  static ExportOrderManage = 6;
}

export class StorageKeys {
  static Auth = "Auth";
}

export class RouteNames {
  static Base = "/";
  static Users = "/users";
  static Login = "/login";
  static Provenance = "/provenance/:reference";
  static BatchProvenance = "/product-provenance/:reference";
  static Admin = "/admin";
  static Tenant = "/tenant";
  static ExportOrders = "/export-orders";
  static Batches = "/product-qrs";
  static Products = "/products";
  static Workflow = "/workflow-stages";
  static WorkflowAssignment = "/workflow-assignment";
  static Settings = "/settings";
  static SysAdminUsers = "/sys-admin-users";
  static NoPermission = "/nopermission";
  static NotFound = "*";
}

export class EventNames {
  static Common = {
    LoginPlatformChanged: "LoginPlatformChanged",
    TenantChanged: "TenantChanged",
    ContractConnectionChanged: "ContractConnectionChanged",
  };
}

export class ContractResponseTypes {
  static OK = 200;
  static BAD_REQUEST = 400;
  static UNAUTHORIZED = 401;
  static FORBIDDEN = 403;
  static NOT_FOUND = 404;
  static INTERNAL_SERVER_ERROR = 500;
  static NOT_IMPLEMENTED = 501;
  static SERVICE_UNAVAILABLE = 503;
}

export class ExportOrderStatuses {
  static NEW = "NEW";
  static READY = "READY";
  static IN_TRANSIT = "IN_TRANSIT";
  static COMPLETE = "COMPLETE";
}

export class TransactionTypes {
  static NFTokenMint = "NFTokenMint";
  static NFTokenCreateOffer = "NFTokenCreateOffer";
  static NFTokenBurn = "NFTokenBurn";
  static NFTokenAcceptOffer = "NFTokenAcceptOffer";
}
