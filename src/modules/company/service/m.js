

export const deleteCompanyImage = errorAsyncHandler(
    async (req, res, next) => {
        const { companyId } = req.params;
        const { imageType, imageIndex } = req.body; // imageType: "logo" or "coverPic"

        if (!["logo", "coverPic"].includes(imageType)) {
            return next(new Error("Invalid image type. Use 'logo' or 'coverPic'", { cause: 400 }));
        }

        // 2. التحقق من وجود الشركة
        const company = await dbService.findOne({
            model: companyModel,
            filter: { _id: companyId, CreatedBy: req.user._id },
        });

        if (!company) {
            return next(new Error("Company not found or not authorized", { cause: 404 }));
        }

        if (imageType === "logo" && company.logo?.public_id) {
            await cloudinary.uploader.destroy(company.logo.public_id);

            await dbService.findOneAndUpdate({
                model: companyModel,
                filter: { _id: companyId },
                data: { $unset: { logo: 1 } },
            });

            return successResponse({
                res,
                message: "Company logo deleted successfully",
                status: 200,
            });
        }

        if (imageType === "coverPic" && Array.isArray(company.coverPic) && company.coverPic.length > 0) {

            if (imageIndex === undefined || imageIndex < 0 || imageIndex >= company.coverPic.length) {
                return next(new Error("Invalid coverPic index", { cause: 400 }));
            }

            // حذف الصورة من Cloudinary
            const coverImage = company.coverPic[imageIndex];
            if (coverImage?.public_id) {
                await cloudinary.uploader.destroy(coverImage.public_id);
            }

            // تحديث coverPic بعد حذف العنصر المطلوب
            const updatedCoverPic = company.coverPic.filter((_, index) => index !== imageIndex);

            await dbService.findOneAndUpdate({
                model: companyModel,
                filter: { _id: companyId },
                data: { coverPic: updatedCoverPic },
            });

            return successResponse({
                res,
                message: `Company cover picture at index ${imageIndex} deleted successfully`,
                status: 200,
            });
        }

        return next(new Error("Image not found or already deleted", { cause: 404 }));
    }
);
