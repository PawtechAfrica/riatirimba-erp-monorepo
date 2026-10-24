# build
pnpm run build
cd dist || exit
scp -r ./ riatirim1@37.120.175.36:erp.riatirimbatvc.ac.ke
cd ../

