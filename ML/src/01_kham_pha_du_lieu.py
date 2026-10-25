import pandas as pd
from pathlib import Path


# Đường dẫn tới dataset
BASE_DIR = Path(__file__).resolve().parent.parent
FILE_CSV = BASE_DIR / "data" / "raw" / "du_lieu_hoc_phan.csv"


# Đọc dữ liệu
df = pd.read_csv(FILE_CSV)


print("=" * 60)
print("THÔNG TIN DATASET")
print("=" * 60)

print("Số dòng:", df.shape[0])
print("Số cột:", df.shape[1])

print("\nTên các cột:")
for cot in df.columns:
    print("-", cot)


print("\n5 dòng đầu tiên:")
print(df.head())


print("\nKiểu dữ liệu:")
print(df.dtypes)


print("\nSố lượng giá trị thiếu:")
print(df.isnull().sum())


print("\nThống kê dữ liệu:")
print(df.describe(include="all"))