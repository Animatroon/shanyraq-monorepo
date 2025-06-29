import { bindMethods } from "../../BindMethonds";
import { Response, Request } from "express";
import { landlordRequest } from "../Landlords/jwt";
import { House } from "../../DB/Schems/Landlords/house";
import { HouseImage } from "../../DB/Schems/Landlords/imageHouse";
import { Landlord } from "../../DB/Schems/Landlords/landlord";
import { isValidObjectId, Types } from "mongoose";
import { ReviewTenant, ReviewType } from "../../DB/Schems/Tenants/reviewsTenant";
import { tenantRequest } from "../Tenants/jwt";
import { Favorite } from "../../DB/Schems/Tenants/Favorite";
import { ReviewLandlord } from "../../DB/Schems/Landlords/reviewLandlord";

interface FilterParams {
    roomCount?: number;
    minMeterSquare?: number;
    maxMeterSquare?: number;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    maxRating?: number;
    floor?: number;
    city?: string;
    adress?: string;
    type?: string;
    rentals?: string;
    isFavorite?: boolean;
  }

class HouseController {

    constructor() {
        bindMethods(this)
    }

    private getFilterSelectObject(params: FilterParams) {
        const filter: any = {};
        let next = '?'
        if (params.roomCount !== undefined) {
          filter.roomCount = Number(params.roomCount);
          next += `roomCount=${params.roomCount}&`
        }
      
        if (params.floor !== undefined) {
          filter.floor = Number(params.floor);
          next += `floor=${params.floor}&`
        }
      
        if (params.city) {
          filter.city = { $regex: params.city, $options: 'i' }; 
          next += `city=${params.city}&`

        }
      
        if (params.adress) {
          filter.adress = { $regex: params.adress, $options: 'i' };
          next += `adress=${params.adress}&`

        }
      
        if (params.type) {
          filter.type = params.type;
          next += `type=${params.type}&`

        }
      
        if (params.rentals) {
          filter.rentals = params.rentals;
          next += `rentals=${params.rentals}&`

        }

        if (params.minMeterSquare !== undefined || params.maxMeterSquare !== undefined) {
            filter.meterSquare = {};
            if (params.minMeterSquare !== undefined) {
                filter.meterSquare.$gte = Number(params.minMeterSquare);
                next += `minMeterSquare=${params.minMeterSquare}&`
                
            }
            if (params.maxMeterSquare !== undefined) {
                filter.meterSquare.$lte = Number(params.maxMeterSquare);
                next += `maxMeterSquare=${params.maxMeterSquare}&`
            } 
        }

        if (params.minPrice !== undefined || params.maxPrice !== undefined) {
            filter.price = {};
            if (params.minPrice !== undefined) {
                filter.price.$gte = Number(params.minPrice);
                next += `minPrice=${params.minPrice}&`

            } 
            if (params.maxPrice !== undefined) {
                filter.price.$lte = Number(params.maxPrice);
                next += `maxPrice=${params.maxPrice}&`

            } 
        }

        if (params.minRating !== undefined || params.maxRating !== undefined) {
            filter.avgRating = {};
            if (params.minRating !== undefined) {
                filter.avgRating.$gte = Number(params.minRating);
                next += `minRating=${params.minRating}&`

            } 
            if (params.maxRating !== undefined) {
                filter.avgRating.$lte = Number(params.maxRating);
                next += `maxRating=${params.maxRating}&`

            } 
        }

        if (next.endsWith('&')) next = next.slice(0, -1);
        if (next === '?') next = '';

        return [filter,next]



    }


    // public
    public async createHouse(req: landlordRequest, res: Response): Promise<void> {
        try {

            const { 
                roomCount,
                meterSquare,
                floor,
                city,
                adress,
                price,
                description,
                type,
                rentals,
            } = req.body
            const userId = req.landlordId 
            
            
            const newHouse = await House.create({
                landlordId: userId,
                roomCount: roomCount,
                meterSquare: meterSquare,
                floor: floor,
                city: city,
                adress: adress,
                price: price,
                description: description,
                type: type,
                rentals: rentals
            })
            
            if (req.files && Array.isArray(req.files)) {
                req.files.map((file: Express.Multer.File) => {
                    HouseImage.create({
                        houseId: newHouse._id,
                        filename: file.originalname,
                        data: file.buffer,
                        contentType: file.mimetype,
                    })
                })
            }
            res.json({message: 'Дом добавлен'})
        }
        catch (e) {
            console.log(e)
            res.status(500).json({message: 'Ошибка сервера'})
        }

    }

    public async getImage(req: Request, res: Response): Promise<void> {
        try {
            const imageId = req.params.imageId.replace(':','')

            const image = await HouseImage.findById(imageId)
            if (!image) {
                res.status(404).json({message: 'Изображение не найдено'})
            }
            const content: any = image?.contentType; 
            res.contentType(content);
            res.send(image?.data);
        }
        catch (e) {
            res.status(500).json({message: 'Ошибка сервера'})
        }
    }

    public async getOneHouse(req: Request, res: Response): Promise<void> {
        try {
            const houseId = req.params.houseId
            
            if (!isValidObjectId(houseId)) {
                res.status(400).json({ error: 'Invalid ID format' });
                return 
            }
            const house = await House.findById(houseId).catch(console.log)

            if (!house) {
                res.status(404).json({message: 'Дом не найден'})
                return
            }

            const landlord = await Landlord.findById(house.landlordId)
            
            if (!landlord) {
                res.status(404).json({message: 'Автор данного поста не существует'})
                return
            }
            
            if (landlord.isBlacklisted) {
                res.status(400).json({message: 'Автор данного поста находится в черном списке'})
            }

            const landlordRating = (await ReviewLandlord.find({ landlordId: house.landlordId })).map(review => review.rating)
            // console.log(landlordRating)
            const avgLandlordRating = landlordRating.length > 0 ? landlordRating.reduce((acc, r) => acc + r, 0) / landlordRating.length : 0;
            const imagesUrl = (await HouseImage.find({houseId: houseId})).map((image) => `/api/house/image/${image._id}`)
            const { roomCount, meterSquare, floor, city, adress, price, description, type, rentals } = house

            const reviews = await ReviewTenant.find({
                reviewType: ReviewType.HOUSE,
                objectId: house._id 
            })
            .limit(5)
            .lean();
              
            const formattedReviews = reviews.map((review) => ({
                rating: review.rating,
                comment: review.comment
            }));
              
            const reviewsForAvg = await ReviewTenant.find({
                reviewType: ReviewType.HOUSE,
                objectId: house._id
            })
            let countRating = 0
            for ( const review of reviewsForAvg ) {
                countRating += review.rating
            }
            const avgRating = reviewsForAvg.length ? (countRating / reviewsForAvg.length).toFixed(1) : 0;

            res.json({house: {
                houseId: houseId,
                author: {
                    authorId: landlord._id,
                    landlordNmae: landlord.firstName + ' ' + landlord.lastName,
                    avgRating: avgLandlordRating
                },
                roomCount,
                meterSquare,
                floor,
                city,
                adress,
                price,
                description,
                type,
                rentals,
                images: imagesUrl,
                avgRating,
                reviews: formattedReviews
            }})



        }
        catch (e) {
            res.status(500).json({message: 'ошибка сервера'})
        }
    }

    public async deleteHouse(req: landlordRequest, res: Response): Promise<void> {
        try {
            const houseId = req.params.houseId.replace(':','')
            const house = await House.findById(houseId)

            if (!house) {
                res.status(404).json({message: 'дом не найден'})
                return
            }

            if (house.landlordId ===  req.landlordId) {
                res.status(401).json({message: 'у вас нет прав для данного действие'})
            }

            const data = await House.deleteOne({_id: new Types.ObjectId(houseId)})
            console.log(data.acknowledged)
            res.json({message: 'дом удален'})
            return
        }
        catch (e) {
            res.status(500).json({message: 'ошибка сервера'})
        }
    }

    public async getHouses(req: tenantRequest, res: Response): Promise<void> {
        try {
          const {
            page = "1",
            search = '',
            sort = '',
            ...filters
          } = req.query;
      
          const userId = req.tenantId ?? undefined;
          const [selectObject] = this.getFilterSelectObject(filters as any);
          const pageNum = parseInt(page as string);
          const skip = (pageNum - 1) * 20;
      
          // Индексы для ускорения (добавь 1 раз в проект или миграцию!)
          // await House.createIndexes({ landlordId: 1 });
          // await House.createIndexes({ city: 1 });
          // await House.createIndexes({ adress: 1 });
          // await Favorite.createIndexes({ tenantsId: 1, houseId: 1 });
          // await ReviewTenant.createIndexes({ objectId: 1 });
          // await HouseImage.createIndexes({ houseId: 1 });
      
          const blackListedLandlords = await Landlord.find({ isBlackList: true }).select('_id').lean();
          const blackListedIds = blackListedLandlords.map(l => l._id);
      
          const searchFilter = search
            ? {
                $or: [
                  { adress: { $regex: search, $options: "i" } },
                  { city: { $regex: search, $options: "i" } },
                  { description: { $regex: search, $options: "i" } }
                ]
              }
            : {};
      
          const query = {
            $and: [
              { landlordId: { $nin: blackListedIds } },
              searchFilter,
              selectObject
            ]
          };
      
          const sortQuery: any = {};
          if (typeof sort === 'string' && sort.trim() !== '') {
            if (sort.startsWith('-')) sortQuery[sort.slice(1)] = -1;
            else sortQuery[sort] = 1;
          }
      
          const [total, houses] = await Promise.all([
            House.countDocuments(query),
            House.find(query)
              .sort(Object.keys(sortQuery).length > 0 ? sortQuery : undefined)
              .skip(skip)
              .limit(20)
              .lean()
          ]);
      
          if (houses.length === 0) {
            res.json({ houses: [], total, next: '' });
            return;
          }
      
          const houseIds = houses.map(h => h._id);
      
          const [allImages, allReviews, allFavorites, allLandlords] = await Promise.all([
            HouseImage.find({ houseId: { $in: houseIds } }).lean(),
            ReviewTenant.find({ reviewType: ReviewType.HOUSE, objectId: { $in: houseIds } }).lean(),
            userId ? Favorite.find({ tenantsId: userId, houseId: { $in: houseIds } }).lean() : [],
            Landlord.find({ _id: { $in: houses.map(h => h.landlordId) } }).lean()
          ]);
          const landlordMap = Object.fromEntries(allLandlords.map(l => [l._id.toString(), l]));
      
          const imageMap: Record<string, string[]> = {};
          for (const img of allImages) {
            const id = img.houseId.toString();
            if (!imageMap[id]) imageMap[id] = [];
            imageMap[id].push(`/house/image/${img._id}`);
          }
      
          const reviewMap: Record<string, number[]> = {};
          for (const r of allReviews) {
            const id = r.objectId.toString();
            if (!reviewMap[id]) reviewMap[id] = [];
            reviewMap[id].push(r.rating);
          }
      
          const favoriteSet = new Set(allFavorites.map(f => f.houseId.toString()));
      
          const result = houses.map((house) => {
            const id = house._id.toString();
            const landlord = landlordMap[house.landlordId.toString()];
            if (!landlord) return null;
      
            const ratings = reviewMap[id] ?? [];
            const avgRating = ratings.length
              ? ratings.reduce((a, b) => a + b, 0) / ratings.length
              : 0;
      
            return {
              houseId: house._id,
              roomCount: house.roomCount,
              meterSquare: house.meterSquare,
              floor: house.floor,
              city: house.city,
              adress: house.adress,
              price: house.price,
              description: house.description,
              type: house.type,
              rentals: house.rentals,
              images: imageMap[id] || [],
              avgRating,
              landlordNmae: `${landlord.firstName} ${landlord.lastName}`,
              isFavorite: favoriteSet.has(id)
            };
          }).filter(Boolean);
      
          res.json({
            next: `/House?page=${pageNum + 1}`,
            total,
            houses: result
          });
      
        } catch (e) {
          console.log(' Ошибка в getHouses:', e);
          res.status(500).json({ message: 'ошибка сервера' });
        }
      }
      
      

    public async updateHouse(req: landlordRequest, res: Response): Promise<void> {
        try {
            const {                 
                roomCount,
                meterSquare,
                floor,
                city,
                adress,
                price,
                description,
                type,
                rentals,
            } = req.body;
    
            const { houseId } = req.params
    
            const house = await House.findById(houseId);
    
            if (!house) {
                res.status(404).json({ message: 'Дом не найден' });
                return;
            }
    
            if (house.landlordId !== req.landlordId) {
                console.log(house.landlordId)
                console.log(req.landlordId)

                res.status(401).json({ message: 'У вас нет прав для данного действия' });
                return;
            }
    
            house.roomCount = roomCount ?? house.roomCount;
            house.meterSquare = meterSquare ?? house.meterSquare;
            house.floor = floor ?? house.floor;
            house.city = city ?? house.city;
            house.adress = adress ?? house.adress;
            house.price = price ?? house.price;
            house.description = description ?? house.description;
            house.type = type ?? house.type;
            house.rentals = rentals ?? house.rentals;
    
            await house.save();
    
            res.status(200).json({ message: 'Дом обновлен', house });
        } 
        catch (e) {
            res.status(500).json({ message: 'Внутренняя ошибка сервера' });
        }
    }

    public async setFavorite(req: tenantRequest, res: Response): Promise<void> {
        try {
            const { houseId } = req.params
            const { tenantId } = req


            const fava = await Favorite.findOne({
                tenantsId: tenantId,
                houseId: houseId
            })

            if (fava) {
                Favorite.findOneAndDelete({
                    tenantsId: tenantId,
                    houseId: houseId
                })
                res.json({message: 'данны дом убран из избранных'})
            }

            Favorite.create({
                tenantsId: tenantId,
                houseId: houseId
            })


            res.json({message: 'данны дом добавлен в избранные'})
        }
        catch (e) {
            res.status(500).json({ message: 'Внутренняя ошибка сервера' });
        }
    }

    // public async getFavorite(req: tenantRequest, res: Response): Promise<void> {
    //     try {
    //         const { tenantId } = req
    //         let { page = "1" } = req.query;     
            
    //         const pageNum = parseInt(page as string);

    //         const skip = (pageNum - 1) * 100;
    //         const blackListedLandlords = await Landlord.find({ blacklisted: true }).select("_id");
    //         const blackListedIds = blackListedLandlords.map(l => l._id);

    //         const favoriteHouseIds = await Favorite.find({ tenantsId: tenantId }).select("houseId");
    //         const favoriteIds = favoriteHouseIds.map(fav => fav.houseId);

    //         const houses = await House.find({
    //             $and: [
    //                 { landlordId: { $nin: blackListedIds } }, 
    //                 { _id: { $in: favoriteIds } } 
    //             ]
    //         })
    //         .limit(100)
    //         .skip(skip);

    //         const result = await Promise.all( houses.map(async (house) => {
    //             const imageUrls = (await HouseImage.find({houseId: house._id})).map((image) => `/api/house/image/${image._id}`)
    //             const landlord = await Landlord.findById(house.landlordId)
    //             const { roomCount, meterSquare, floor, city, adress, price, description, type, rentals } = house
    //             if (!landlord) return null;
    //             const reviews = await ReviewTenant.find({
    //                 reviewType: 'house',
    //                 objectId: house._id
    //             })
    //             let countRating = 0
    //             for ( const review of reviews ) {
    //                 countRating += review.rating
    //             }
    //             const avgRating = countRating / reviews.length
    //             return {
    //                 house: {
    //                     houseId: house._id,
    //                     roomCount,
    //                     meterSquare,
    //                     floor,
    //                     city,
    //                     adress,
    //                     price,
    //                     description,
    //                     type,
    //                     rentals,
    //                     avgRating,
    //                     images: imageUrls,
    //                     landlordNmae: landlord.firstName + ' ' + landlord.lastName
    //                 }
    //             }
    //         }))
    //         const filteredResult = result.filter(Boolean);

    //         res.json({
    //             FovatiteHouses: filteredResult
    //         })

    //     }
    //     catch (e) {
    //         res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    //     }
    
    
    // }

    public async getFavorite(req: tenantRequest, res: Response): Promise<void> {
        try {
          const { tenantId } = req;
          let { page = "1" } = req.query;
      
          const pageNum = parseInt(page as string);
          const skip = (pageNum - 1) * 20;
      
          const favoriteDocs = await Favorite.find({ tenantsId: tenantId }).select('houseId').lean();
          const houseIds = favoriteDocs.map(fav => fav.houseId);
      
          if (houseIds.length === 0) {
            res.json({ favoriteHouses: [] });
            return;
          }
      

          const houses = await House.find({ _id: { $in: houseIds } })
            .skip(skip)
            .limit(20)
            .lean();
      
          const allImages = await HouseImage.find({ houseId: { $in: houseIds } }).lean();
          const allReviews = await ReviewTenant.find({
            reviewType: ReviewType.HOUSE,
            objectId: { $in: houseIds }
          }).lean();
          const allLandlords = await Landlord.find({
            _id: { $in: houses.map(h => h.landlordId) }
          }).lean();
      
          const landlordMap = Object.fromEntries(
            allLandlords.map(l => [l._id.toString(), l])
          );
      
          const imageMap: Record<string, string[]> = {};
          for (const img of allImages) {
            const id = img.houseId.toString();
            if (!imageMap[id]) imageMap[id] = [];
            imageMap[id].push(`/house/image/${img._id}`);
          }
      
          const reviewMap: Record<string, number[]> = {};
          for (const r of allReviews) {
            const id = r.objectId.toString();
            if (!reviewMap[id]) reviewMap[id] = [];
            reviewMap[id].push(r.rating);
          }
      
          const result = houses.map((house) => {
            const id = house._id.toString();
            const landlord = landlordMap[house.landlordId.toString()];
            if (!landlord) return null;
      
            const ratings = reviewMap[id] ?? [];
            const avgRating = ratings.length
              ? ratings.reduce((a, b) => a + b, 0) / ratings.length
              : 0;
      
            return {
              houseId: house._id,
              roomCount: house.roomCount,
              meterSquare: house.meterSquare,
              floor: house.floor,
              city: house.city,
              adress: house.adress,
              price: house.price,
              description: house.description,
              type: house.type,
              rentals: house.rentals,
              images: imageMap[id] || [],
              avgRating,
              landlordNmae: `${landlord.firstName} ${landlord.lastName}`,
              isFavorite: true
            };
          }).filter(Boolean);
      
          res.json({ favoriteHouses: result });
      
        } catch (e) {
          console.log('💥 Ошибка в getFavorite:', e);
          res.status(500).json({ message: 'ошибка сервера' });
        }
      }
      

    public async deleteFavorite(req: tenantRequest, res: Response): Promise<void> {
        try {
            const { houseId } = req.params
            const { tenantId } = req

            await Favorite.findOneAndDelete({houseId: houseId, tenantsId: tenantId})
            res.json({message: 'дом удален из избранных'})
        }
        catch (e) {
            res.status(500).json({ message: 'Внутренняя ошибка сервера' });
        }
    }
}

export default new HouseController()