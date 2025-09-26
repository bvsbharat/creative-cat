import os
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, Depends, HTTPException
from fastapi_mcp import FastApiMCP
from pydantic import BaseModel
import snowflake.connector
from snowflake.connector import SnowflakeConnection
from snowflake.connector.cursor import SnowflakeCursor
import dotenv
dotenv.load_dotenv()

# Snowflake configuration model
class SnowflakeConfig(BaseModel):
    account: str
    user: str
    password: str
    warehouse: Optional[str] = None
    database: Optional[str] = None
    schema_name: Optional[str] = None  # Changed from schema to schema_name
    role: Optional[str] = None

# Global connection pool
snowflake_connection: Optional[SnowflakeConnection] = None

def get_snowflake_config() -> SnowflakeConfig:
    return SnowflakeConfig(
        account=os.getenv("SNOWFLAKE_ACCOUNT", "AWS_HACKATHON_EVENT_XBBXLI"),
        user=os.getenv("SNOWFLAKE_USER", "USER"),
        password=os.getenv("SNOWFLAKE_PASSWORD", "BarrelUntaggedLetdownHeadsman39"),
        warehouse=os.getenv("SNOWFLAKE_WAREHOUSE", "DEFAULT_WH"),
        database=os.getenv("SNOWFLAKE_DATABASE", "ANALYTIC_DATASET_DEMOSAMPLE"),
        schema_name=os.getenv("SNOWFLAKE_SCHEMA"),  # Changed from schema to schema_name
        role="ATTENDEE_ROLE"
    )

def get_snowflake_connection() -> SnowflakeConnection:
    global snowflake_connection
    if snowflake_connection is None or snowflake_connection.is_closed():
        config = get_snowflake_config()
        if not config.account or not config.user or not config.password:
            raise ValueError("Missing required Snowflake connection parameters")
        
        connection_params = {
            "account": config.account,
            "user": config.user,
            "password": config.password,
        }
        
        if config.warehouse:
            connection_params["warehouse"] = config.warehouse
        if config.database:
            connection_params["database"] = config.database
        if config.schema_name:  # Changed from schema to schema_name
            connection_params["schema"] = config.schema_name
        if config.role:
            connection_params["role"] = config.role
            
        snowflake_connection = snowflake.connector.connect(**connection_params)
    
    return snowflake_connection

# Create FastAPI app
app = FastAPI(
    title="Snowflake MCP Server",
    version="0.1.0",
    description="MCP server for Snowflake database operations"
)

# Create FastApiMCP instance
mcp = FastApiMCP(app)

class QueryRequest(BaseModel):
    query: str
    fetch_results: bool = True

@app.post("/api/execute_query", tags=["snowflake"])
async def execute_query(request: QueryRequest) -> Dict[str, Any]:
    """Execute a SQL query on Snowflake and optionally return results"""
    try:
        conn = get_snowflake_connection()
        cursor = conn.cursor()
        
        cursor.execute(request.query)
        
        if request.fetch_results and cursor.description:
            columns = [desc[0] for desc in cursor.description]
            rows = cursor.fetchall()
            return {
                "success": True,
                "columns": columns,
                "rows": rows,
                "row_count": len(rows)
            }
        else:
            return {
                "success": True,
                "message": f"Query executed successfully. Rows affected: {cursor.rowcount}"
            }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }
    finally:
        if 'cursor' in locals():
            cursor.close()

@app.get("/api/list_databases", tags=["snowflake"])
async def list_databases() -> Dict[str, Any]:
    """List all databases accessible to the current user"""
    try:
        conn = get_snowflake_connection()
        cursor = conn.cursor()
        
        cursor.execute("SHOW DATABASES")
        databases = []
        for row in cursor.fetchall():
            databases.append({
                "name": row[1],
                "created_on": str(row[0]),
                "owner": row[3] if len(row) > 3 else None
            })
        
        return {
            "success": True,
            "databases": databases
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }
    finally:
        if 'cursor' in locals():
            cursor.close()

@app.get("/api/list_schemas", tags=["snowflake"])
async def list_schemas(database: Optional[str] = None) -> Dict[str, Any]:
    """List all schemas in a database"""
    try:
        conn = get_snowflake_connection()
        cursor = conn.cursor()
        
        if database:
            cursor.execute(f"SHOW SCHEMAS IN DATABASE {database}")
        else:
            cursor.execute("SHOW SCHEMAS")
            
        schemas = []
        for row in cursor.fetchall():
            schemas.append({
                "name": row[1],
                "database": row[2] if len(row) > 2 else database,
                "created_on": str(row[0])
            })
        
        return {
            "success": True,
            "schemas": schemas
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }
    finally:
        if 'cursor' in locals():
            cursor.close()

@app.get("/api/list_tables", tags=["snowflake"])
async def list_tables(database: Optional[str] = None, schema: Optional[str] = None) -> Dict[str, Any]:
    """List all tables in a schema"""
    try:
        conn = get_snowflake_connection()
        cursor = conn.cursor()
        
        query = "SHOW TABLES"
        if database and schema:
            query += f" IN SCHEMA {database}.{schema}"
        elif schema:
            query += f" IN SCHEMA {schema}"
        
        cursor.execute(query)
        tables = []
        for row in cursor.fetchall():
            tables.append({
                "name": row[1],
                "database": row[2] if len(row) > 2 else database,
                "schema": row[3] if len(row) > 3 else schema,
                "created_on": str(row[0])
            })
        
        return {
            "success": True,
            "tables": tables
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }
    finally:
        if 'cursor' in locals():
            cursor.close()

@app.get("/api/describe_table", tags=["snowflake"])
async def describe_table(table_name: str, database: Optional[str] = None, schema: Optional[str] = None) -> Dict[str, Any]:
    """Get the structure of a table including column names, types, and constraints"""
    try:
        conn = get_snowflake_connection()
        cursor = conn.cursor()
        
        full_table_name = table_name
        if database and schema:
            full_table_name = f"{database}.{schema}.{table_name}"
        elif schema:
            full_table_name = f"{schema}.{table_name}"
        
        cursor.execute(f"DESCRIBE TABLE {full_table_name}")
        columns = []
        for row in cursor.fetchall():
            columns.append({
                "name": row[0],
                "type": row[1],
                "kind": row[2],
                "null": row[3],
                "default": row[4],
                "primary_key": row[5],
                "unique_key": row[6],
                "check": row[7] if len(row) > 7 else None
            })
        
        return {
            "success": True,
            "table_name": full_table_name,
            "columns": columns
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }
    finally:
        if 'cursor' in locals():
            cursor.close()

# Mount MCP to expose FastAPI endpoints as MCP tools
mcp.mount()

@app.get("/")
async def root():
    return {"message": "Welcome to Snowflake MCP Server"}

@app.get("/health")
async def health_check():
    try:
        conn = get_snowflake_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT 1")
        cursor.fetchone()
        cursor.close()
        return {"status": "healthy", "snowflake": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}

@app.get("/status")
async def status():
    return {"status": "operational", "server": "Snowflake MCP Server"}


