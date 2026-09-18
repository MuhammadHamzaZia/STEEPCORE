-- ==============================================================================
-- STEEPCORE / SUPABASE DATABASE FIX & SECURITY HARDENING SCRIPT
-- ==============================================================================
-- 1. FIXES RENDER BACKEND ERROR: "relation UserProgresses does not exist (42P01)"
-- 2. FIXES SUPABASE SECURITY ADVISOR: "12 Issues: RLS Disabled in Public"
-- 3. MITIGATES SUPABASE BILLING/QUOTA ALERT BY PREVENTING PUBLIC POSTGREST SCRAPING
-- ==============================================================================

-- STEP 1: CREATE USERPROGRESSES TABLE & INDEXES
CREATE TABLE IF NOT EXISTS public."UserProgresses" (
    "Id" uuid NOT NULL PRIMARY KEY,
    "UserId" text NOT NULL,
    "BlueprintId" uuid NOT NULL,
    "NodeId" uuid NOT NULL,
    "Status" text NOT NULL DEFAULT 'completed',
    "Notes" text NULL,
    "CreatedAt" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    "UpdatedAt" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT "FK_UserProgresses_AspNetUsers_UserId" FOREIGN KEY ("UserId") 
        REFERENCES public."AspNetUsers" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_UserProgresses_Blueprints_BlueprintId" FOREIGN KEY ("BlueprintId") 
        REFERENCES public."Blueprints" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_UserProgresses_FlowchartNodes_NodeId" FOREIGN KEY ("NodeId") 
        REFERENCES public."FlowchartNodes" ("Id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "IX_UserProgresses_BlueprintId" ON public."UserProgresses" ("BlueprintId");
CREATE INDEX IF NOT EXISTS "IX_UserProgresses_NodeId" ON public."UserProgresses" ("NodeId");
CREATE INDEX IF NOT EXISTS "IX_UserProgresses_UserId" ON public."UserProgresses" ("UserId");

-- ==============================================================================
-- STEP 2: ENABLE ROW LEVEL SECURITY (RLS) ACROSS ALL 12 PUBLIC TABLES
-- (Resolves all 12 Security Advisor Critical Alerts in Supabase)
-- Note: Your ASP.NET Core backend connects directly via PostgreSQL connection pooler
-- as the 'postgres' role, which automatically bypasses RLS for normal API operations.
-- ==============================================================================
ALTER TABLE IF EXISTS public."Blueprints" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."FlowchartNodes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."FlowchartEdges" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."Transactions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."UserProgresses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."AspNetUsers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."AspNetRoles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."AspNetUserRoles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."AspNetUserClaims" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."AspNetUserLogins" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."AspNetUserTokens" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."AspNetRoleClaims" ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- STEP 3: OPTIONAL PERMISSIVE READ POLICIES (If direct PostgREST is accessed)
-- ==============================================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'Blueprints' AND policyname = 'Allow read published blueprints') THEN
        CREATE POLICY "Allow read published blueprints" ON public."Blueprints" FOR SELECT USING ("IsPublished" = true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'FlowchartNodes' AND policyname = 'Allow read flowchart nodes') THEN
        CREATE POLICY "Allow read flowchart nodes" ON public."FlowchartNodes" FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'FlowchartEdges' AND policyname = 'Allow read flowchart edges') THEN
        CREATE POLICY "Allow read flowchart edges" ON public."FlowchartEdges" FOR SELECT USING (true);
    END IF;
END $$;
