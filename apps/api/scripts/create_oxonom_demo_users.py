import asyncio
from datetime import datetime
from uuid import uuid4
from sqlalchemy import select
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.ext.asyncio import create_async_engine

from src.db.organizations import Organization
from src.db.users import User
from src.db.user_organizations import UserOrganization
from src.security.security import security_hash_password
from config.config import get_learnhouse_config

async def main():
    config = get_learnhouse_config()
    db_url = config.database_config.sql_connection_string
    if not "+asyncpg" in db_url:
        db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)
    
    engine = create_async_engine(db_url, echo=False)
    
    async with AsyncSession(engine, expire_on_commit=False) as session:
        # Get default org
        org_stmt = select(Organization).where(Organization.slug == "default")
        org = (await session.execute(org_stmt)).scalars().first()
        if not org:
            print("Default org not found! Creating default organization...")
            org = Organization(
                name="Default Organization",
                slug="default",
                description="Default Organization",
                org_uuid=f"org_{uuid4()}",
                creation_date=str(datetime.now()),
                update_date=str(datetime.now())
            )
            session.add(org)
            await session.commit()
            await session.refresh(org)
        
        users_to_ensure = [
            {
                "username": "admin",
                "email": "admin@oxonom.com",
                "first_name": "Admin",
                "last_name": "Oxonom",
                "password": "Ugur2803*",
                "role_id": 1,
                "is_superadmin": True,
            },
            {
                "username": "teacher",
                "email": "teacher@oxonom.com",
                "first_name": "Teacher",
                "last_name": "Oxonom",
                "password": "Ugur2803*",
                "role_id": 3,
                "is_superadmin": False,
            },
            {
                "username": "ogretmen",
                "email": "ogretmen@oxonom.com",
                "first_name": "Öğretmen",
                "last_name": "Oxonom",
                "password": "Ugur2803*",
                "role_id": 3,
                "is_superadmin": False,
            },
            {
                "username": "student",
                "email": "student@oxonom.com",
                "first_name": "Student",
                "last_name": "Oxonom",
                "password": "Ugur2803*",
                "role_id": 4,
                "is_superadmin": False,
            }
        ]
        
        # Get all orgs
        all_orgs_stmt = select(Organization)
        all_orgs = (await session.execute(all_orgs_stmt)).scalars().all()
        print(f"Found {len(all_orgs)} organizations to link demo users to.")

        for u_data in users_to_ensure:
            stmt = select(User).where((User.email == u_data["email"]) | (User.username == u_data["username"]))
            user = (await session.execute(stmt)).scalars().first()
            
            hashed_pwd = security_hash_password(u_data["password"])
            now_str = str(datetime.now())
            
            if user:
                print(f"Updating user {u_data['email']}...")
                user.email = u_data["email"]
                user.username = u_data["username"]
                user.first_name = u_data["first_name"]
                user.last_name = u_data["last_name"]
                user.password = hashed_pwd
                user.email_verified = True
                user.is_superadmin = u_data["is_superadmin"]
                user.failed_login_attempts = 0
                user.locked_until = None
                user.update_date = now_str
                session.add(user)
                await session.commit()
                await session.refresh(user)
            else:
                print(f"Creating user {u_data['email']}...")
                user = User(
                    user_uuid=f"user_{uuid4()}",
                    username=u_data["username"],
                    email=u_data["email"],
                    first_name=u_data["first_name"],
                    last_name=u_data["last_name"],
                    password=hashed_pwd,
                    email_verified=True,
                    is_superadmin=u_data["is_superadmin"],
                    failed_login_attempts=0,
                    locked_until=None,
                    creation_date=now_str,
                    update_date=now_str
                )
                session.add(user)
                await session.commit()
                await session.refresh(user)
            
            # Check UserOrganization link across all orgs
            for o in all_orgs:
                uo_stmt = select(UserOrganization).where(
                    (UserOrganization.user_id == user.id) & (UserOrganization.org_id == o.id)
                )
                uo = (await session.execute(uo_stmt)).scalars().first()
                if uo:
                    uo.role_id = u_data["role_id"]
                    uo.update_date = now_str
                    session.add(uo)
                else:
                    uo = UserOrganization(
                        user_id=user.id,
                        org_id=o.id,
                        role_id=u_data["role_id"],
                        creation_date=now_str,
                        update_date=now_str
                    )
                    session.add(uo)
                await session.commit()
                print(f"User {u_data['email']} -> org '{o.slug}' with role_id {u_data['role_id']} ✅")

    await engine.dispose()
    print("All demo users created/updated successfully!")

if __name__ == "__main__":
    asyncio.run(main())
