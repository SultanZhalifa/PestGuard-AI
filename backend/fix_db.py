import sqlite3
conn = sqlite3.connect('warehouse.db')
conn.execute("UPDATE logs SET risk='info' WHERE type='Person' AND risk='danger';")
conn.commit()
conn.close()
print('DB Updated')
