from fastapi import FastAPI, Depends
from fastapi_mcp import MCP, MCPConfig

# Configure MCP
mcp_config = MCPConfig(
    title="Snowcone API",
    version="0.1.0",
)

# Create FastAPI app with MCP
app = FastAPI()
mcp = MCP(config=mcp_config)
mcp.init_app(app)

@app.get("/")
async def root():
    return {"message": "Welcome to Snowcone API"}

# Example endpoint using MCP
@app.get("/status", dependencies=[Depends(mcp.auth_dependency)])
async def status():
    return {"status": "operational"}


