import asyncio
from sqlalchemy import text
from src.core.events.database import get_db_session

async def main():
    async for session in get_db_session():
        await session.execute(text('''
            CREATE TABLE IF NOT EXISTS feedback (
                id SERIAL PRIMARY KEY,
                message TEXT NOT NULL,
                reaction VARCHAR(20),
                user_name VARCHAR(255),
                user_email VARCHAR(255),
                attachments JSON,
                created_at VARCHAR(50) DEFAULT ''
            )
        '''))
        await session.commit()
        print('Feedback table created')

asyncio.run(main())
