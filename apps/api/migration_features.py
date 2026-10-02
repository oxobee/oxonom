import asyncio
from sqlalchemy import text
from src.core.events.database import get_db_session

async def main():
    async for session in get_db_session():
        await session.execute(text('ALTER TABLE board ADD COLUMN IF NOT EXISTS features JSON DEFAULT NULL'))
        await session.commit()
        print('Done')

asyncio.run(main())
