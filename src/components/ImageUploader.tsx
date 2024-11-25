"use client";

import { getPinataKey } from "@/actions/getPinataKey";
import { pinata } from "@/config/pinata.client";
import { cn } from "@/lib/cssUtils";
import { CircleNotch, UploadSimple } from "@phosphor-icons/react/dist/ssr";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useRef, useState } from "react";
import {
  type FieldValues,
  type Path,
  useController,
  useFormContext,
} from "react-hook-form";
import { Button, type ButtonProps } from "./ui/Button";

type Props = Omit<ButtonProps, "variant" | "onClick" | "onError"> & {
  maxSizeMB?: number;
  onSuccess?: (imageUrl: string) => void;
  onError?: (error: string) => void;
};

const mbToBytes = (mb: number) => mb * 10 ** 6;

export const ImageUploader = ({
  className,
  maxSizeMB = 5,
  onSuccess,
  onError,
  ...props
}: Props) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadedImage, setUploadedImage] = useState("");

  const { mutate: upload, isPending } = useMutation({
    mutationFn: async (file: File) => {
      const pinataJWT = await getPinataKey();
      const upload = await pinata.upload.file(file).key(pinataJWT.JWT);
      const url = await pinata.gateways.convert(upload.IpfsHash);
      return url;
    },
    onSuccess: (imageUrl: string) => {
      setUploadedImage(imageUrl);
      if (typeof onSuccess === "function") {
        onSuccess(imageUrl);
      }
    },
    onError: (error) => {
      if (typeof onError === "function") {
        onError(error.message);
      }
    },
  });

  const validateFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;

      const [file] = Array.from(files);

      if (file.size > mbToBytes(maxSizeMB)) {
        if (typeof onError === "function")
          onError(`Max file size is ${maxSizeMB}MB`);
        return;
      }

      upload(file);
    },
    [maxSizeMB, onError, upload],
  );

  return (
    <Button
      className={cn(
        "size-12 rounded-full border border-input-border",
        className,
      )}
      variant="ghost"
      onClick={() => fileInputRef.current?.click()}
      isLoading={isPending}
      style={
        uploadedImage
          ? {
              backgroundImage: `url(${uploadedImage})`,
              backgroundSize: "cover",
            }
          : undefined
      }
      {...props}
    >
      {uploadedImage ? null : isPending ? (
        <CircleNotch weight="bold" className="size-1/3 animate-spin" />
      ) : (
        <UploadSimple weight="bold" className="size-1/3" />
      )}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/png, image/gif, image/jpeg"
        onChange={(e) => validateFiles(e.target.files)}
      />
    </Button>
  );
};

type ControlledProps<TFieldValues extends FieldValues, _TContext> = Omit<
  Props,
  "onSuccess" | "onError"
> & {
  fieldName: Path<TFieldValues>;
};

export const ControlledImageUploader = <
  TFieldValues extends FieldValues,
  TContext,
>({
  fieldName,
  ...imageUploaderProps
}: ControlledProps<TFieldValues, TContext>) => {
  const { control, setError } = useFormContext<TFieldValues>();

  const {
    field: { onChange },
  } = useController<TFieldValues>({
    control,
    name: fieldName,
  });

  return (
    <ImageUploader
      {...imageUploaderProps}
      onSuccess={(imageUrl) => onChange(imageUrl)}
      onError={(errorMessage) =>
        setError(fieldName, {
          type: "custom",
          message: errorMessage,
        })
      }
    />
  );
};
